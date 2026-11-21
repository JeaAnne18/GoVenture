import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTripAccess, toItemView } from "@/lib/trip-server";
import TripPlanner from "@/components/planner/TripPlanner";
import type { MemberView, TripView } from "@/lib/planner";
import type { SavedPlaceInfo } from "@/lib/places";

const dayString = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export default async function PlannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const access = await getTripAccess(id, session.user.id);
  if (!access) notFound(); // not her trip, or it doesn't exist

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      members: { where: { status: { not: "DECLINED" } }, include: { user: { select: { id: true, name: true } } } },
      items: { include: { place: true }, orderBy: [{ day: "asc" }, { position: "asc" }] },
    },
  });
  if (!trip) notFound();

  const savedRows = await prisma.savedPlace.findMany({
    where: { userId: session.user.id },
    include: { place: true },
    orderBy: { createdAt: "desc" },
  });

  const tripView: TripView = {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    destLat: trip.destLat,
    destLng: trip.destLng,
    startDate: dayString(trip.startDate),
    endDate: dayString(trip.endDate),
    dayCount: trip.dayCount,
    canEdit: access === "owner" || access === "editor",
  };

  const members: MemberView[] = [
    { id: trip.owner.id, name: trip.owner.name, role: "OWNER", status: "ACCEPTED" },
    ...trip.members.map((m) => ({ id: m.user.id, name: m.user.name, role: m.role, status: m.status as "ACCEPTED" | "PENDING" })),
  ];

  const saved: SavedPlaceInfo[] = savedRows.map((r) => ({
    savedId: r.id,
    note: r.note ?? "",
    compare: null,
    externalId: r.place.externalId,
    name: r.place.name,
    address: r.place.address,
    lat: r.place.lat,
    lng: r.place.lng,
    category: r.place.category,
  }));

  return <TripPlanner trip={tripView} initialItems={trip.items.map(toItemView)} members={members} initialSaved={saved} />;
}