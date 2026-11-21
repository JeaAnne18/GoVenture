import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import ExploreMap from "./ExploreMap";
import { parseCompare } from "@/lib/distance";
import type { SavedPlaceInfo } from "@/lib/places";

export default async function ExplorePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const rows = await prisma.savedPlace.findMany({
    where: { userId: session.user.id },
    include: { place: true },
    orderBy: { createdAt: "desc" },
  });

  const saved: SavedPlaceInfo[] = rows.map((r) => ({
    savedId: r.id,
    note: r.note ?? "",
    compare: parseCompare(r.compare),
    externalId: r.place.externalId,
    name: r.place.name,
    address: r.place.address,
    lat: r.place.lat,
    lng: r.place.lng,
    category: r.place.category,
  }));

  return (
    <AppShell bleed>
      <ExploreMap saved={saved} />
    </AppShell>
  );
}