"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { parseCompare, type SavedCompare } from "@/lib/distance";
import type { PlaceInfo } from "@/lib/places";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("You need to sign in first.");
  return session.user.id;
}

// Saves a place for the signed-in user, or updates the note if it is already saved.
export async function savePlace(place: PlaceInfo, note: string, compare: SavedCompare | null = null) {
  const userId = await requireUserId();
  const cleanNote = note.trim().slice(0, 2000);
  // Never trust data from the browser: only keep a comparison that has the right shape.
  const safeCompare = parseCompare(compare);
  const compareValue = safeCompare ? (safeCompare as unknown as Prisma.InputJsonValue) : Prisma.DbNull;

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

  const saved = await prisma.savedPlace.upsert({
    where: { userId_placeId: { userId, placeId: dbPlace.id } },
    update: { note: cleanNote, compare: compareValue },
    create: { userId, placeId: dbPlace.id, note: cleanNote, compare: compareValue },
  });

  revalidatePath("/explore");
  return { savedId: saved.id };
}

export async function removePlace(savedId: string) {
  const userId = await requireUserId();
  // deleteMany with userId makes sure people can only delete their own bookmarks.
  await prisma.savedPlace.deleteMany({ where: { id: savedId, userId } });
  revalidatePath("/explore");
}