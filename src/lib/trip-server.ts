import { prisma } from "@/lib/prisma";
import { countDays } from "@/lib/trips";
import type { ItemView } from "@/lib/planner";

export type TripAccess = "owner" | "editor" | "viewer" | null;

// Who is this person on this trip? Owners and accepted members get in. Everyone else gets null.
export async function getTripAccess(tripId: string, userId: string): Promise<TripAccess> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { ownerId: true } });
  if (!trip) return null;
  if (trip.ownerId === userId) return "owner";

  const member = await prisma.tripMember.findUnique({ where: { tripId_userId: { tripId, userId } } });
  if (!member || member.status !== "ACCEPTED") return null;
  return member.role === "EDITOR" ? "editor" : "viewer";
}

// How many days the trip has: from its dates, or from the number she added by hand.
export function totalDays(trip: { startDate: Date | null; endDate: Date | null; dayCount: number }): number {
  if (trip.startDate && trip.endDate) {
    return countDays(trip.startDate.toISOString().slice(0, 10), trip.endDate.toISOString().slice(0, 10));
  }
  return trip.dayCount;
}

type ItemRow = {
  id: string;
  day: number;
  position: number;
  kind: "STOP" | "NOTE";
  text: string | null;
  place: { externalId: string; name: string; address: string | null; lat: number; lng: number; category: string | null } | null;
};

export function toItemView(r: ItemRow): ItemView {
  return {
    id: r.id,
    day: r.day,
    position: r.position,
    kind: r.kind,
    text: r.text,
    place: r.place
      ? {
          externalId: r.place.externalId,
          name: r.place.name,
          address: r.place.address,
          lat: r.place.lat,
          lng: r.place.lng,
          category: r.place.category,
        }
      : null,
  };
}