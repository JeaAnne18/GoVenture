"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export type CreateTripInput = {
  name: string;
  destination: string;
  destLat: number | null;
  destLng: number | null;
  startDate: string | null; // "2026-12-12"
  endDate: string | null;
  inviteUserIds: string[]; // GoVenture users to invite
};

export type CreateTripResult = { ok: true; id: string } | { ok: false; error: string };

export async function createTrip(input: CreateTripInput): Promise<CreateTripResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "Please sign in again." };
  const userId = session.user.id;

  // Never trust the browser: check everything again on the server.
  const name = input.name.trim();
  const destination = input.destination.trim();
  if (!name || name.length > 80) return { ok: false, error: "Give your trip a name (up to 80 characters)." };
  if (!destination || destination.length > 200) return { ok: false, error: "Choose where you’re going." };

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let dayCount = 1;
  if (input.startDate || input.endDate) {
    if (!input.startDate || !input.endDate || !DAY.test(input.startDate) || !DAY.test(input.endDate)) {
      return { ok: false, error: "Pick both a start date and an end date." };
    }
    startDate = new Date(`${input.startDate}T00:00:00Z`);
    endDate = new Date(`${input.endDate}T00:00:00Z`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return { ok: false, error: "The end date can’t be before the start date." };
    }
    dayCount = (endDate.getTime() - startDate.getTime()) / DAY_MS + 1;
    if (dayCount > 90) return { ok: false, error: "Trips can be up to 90 days long." };
  }

  const destLat = input.destLat !== null && Number.isFinite(input.destLat) ? input.destLat : null;
  const destLng = input.destLng !== null && Number.isFinite(input.destLng) ? input.destLng : null;

  // Only invite people who really have an account (and never yourself).
  const wanted = [...new Set(input.inviteUserIds)].filter((id) => id !== userId).slice(0, 20);
  const invitees = wanted.length ? await prisma.user.findMany({ where: { id: { in: wanted } }, select: { id: true } }) : [];

  const trip = await prisma.trip.create({
    data: {
      name,
      destination,
      destLat,
      destLng,
      startDate,
      endDate,
      dayCount,
      ownerId: userId,
      members: { create: invitees.map((u) => ({ userId: u.id, role: "EDITOR" as const, status: "PENDING" as const })) },
    },
  });

  revalidatePath("/trips");
  revalidatePath("/");
  return { ok: true, id: trip.id };
}