"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTripAccess, toItemView, totalDays } from "@/lib/trip-server";
import type { ItemView } from "@/lib/planner";
import type { PlaceInfo } from "@/lib/places";

// Only the owner and editors may change a trip. Viewers can only look.
async function requireEditor(tripId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Please sign in again.");
  const access = await getTripAccess(tripId, session.user.id);
  if (access !== "owner" && access !== "editor") throw new Error("You can’t edit this trip.");
  return session.user.id;
}

async function checkDay(tripId: string, day: number) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new Error("Trip not found.");
  if (!Number.isInteger(day) || day < 1 || day > totalDays(trip)) throw new Error("That day doesn’t exist.");
  return trip;
}

async function nextPosition(tripId: string, day: number) {
  const last = await prisma.itineraryItem.aggregate({ where: { tripId, day }, _max: { position: true } });
  return (last._max.position ?? -1) + 1;
}

export async function addStop(tripId: string, day: number, place: PlaceInfo): Promise<ItemView> {
  await requireEditor(tripId);
  await checkDay(tripId, day);

  const dbPlace = await prisma.place.upsert({
    where: { externalId: place.externalId },
    update: { name: place.name, address: place.address, lat: place.lat, lng: place.lng, category: place.category },
    create: {
      externalId: place.externalId,
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      category: place.category,
    },
  });

  const item = await prisma.itineraryItem.create({
    data: { tripId, day, position: await nextPosition(tripId, day), kind: "STOP", placeId: dbPlace.id },
    include: { place: true },
  });

  revalidatePath(`/trips/${tripId}`);
  return toItemView(item);
}

export async function addNote(tripId: string, day: number, text: string): Promise<ItemView> {
  await requireEditor(tripId);
  await checkDay(tripId, day);

  const clean = text.trim();
  if (!clean || clean.length > 1000) throw new Error("A note needs 1 to 1000 characters.");

  const item = await prisma.itineraryItem.create({
    data: { tripId, day, position: await nextPosition(tripId, day), kind: "NOTE", text: clean },
    include: { place: true },
  });

  revalidatePath(`/trips/${tripId}`);
  return toItemView(item);
}

export async function removeItem(itemId: string): Promise<void> {
  const item = await prisma.itineraryItem.findUnique({ where: { id: itemId }, select: { tripId: true } });
  if (!item) return;
  await requireEditor(item.tripId);
  await prisma.itineraryItem.delete({ where: { id: itemId } });
  revalidatePath(`/trips/${item.tripId}`);
}

// Swaps an item with its neighbour above or below in the same day. Returns that neighbour's id.
export async function moveItem(itemId: string, direction: "up" | "down"): Promise<string | null> {
  const item = await prisma.itineraryItem.findUnique({ where: { id: itemId } });
  if (!item) return null;
  await requireEditor(item.tripId);

  const neighbour = await prisma.itineraryItem.findFirst({
    where: {
      tripId: item.tripId,
      day: item.day,
      position: direction === "up" ? { lt: item.position } : { gt: item.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return null;

  await prisma.$transaction([
    prisma.itineraryItem.update({ where: { id: item.id }, data: { position: neighbour.position } }),
    prisma.itineraryItem.update({ where: { id: neighbour.id }, data: { position: item.position } }),
  ]);

  revalidatePath(`/trips/${item.tripId}`);
  return neighbour.id;
}

// For trips without dates: adds one more day at the end.
export async function addDay(tripId: string): Promise<number> {
  await requireEditor(tripId);
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.startDate || trip.endDate) throw new Error("This trip’s days come from its dates.");
  if (trip.dayCount >= 90) throw new Error("Trips can be up to 90 days long.");

  const updated = await prisma.trip.update({ where: { id: tripId }, data: { dayCount: { increment: 1 } } });
  revalidatePath(`/trips/${tripId}`);
  return updated.dayCount;
}