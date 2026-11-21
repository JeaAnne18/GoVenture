import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import NewTripButton from "@/components/trips/NewTripButton";
import TripCard from "@/components/trips/TripCard";

export default async function MyTripsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const trips = await prisma.trip.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" }, // newest first, so a trip she just created is at the top
  });

  return (
    <AppShell>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold">My Trips</h1>
          <p className="mt-1 text-sm text-[#5F6370]">
            {trips.length === 0 ? "Plan your first adventure." : `${trips.length} ${trips.length === 1 ? "trip" : "trips"} planned`}
          </p>
        </div>
        <NewTripButton />
      </header>

      {trips.length === 0 ? (
        <div className="rounded-[28px] bg-white p-10 text-center shadow-[0_8px_24px_-12px_rgba(15,94,102,0.18)]">
          <h2 className="text-lg font-semibold">No trips yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#5F6370]">
            Pick a destination and your dates, and your trip will show up here.
          </p>
          <div className="mt-5 flex justify-center">
            <NewTripButton label="Create your first trip" />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </div>
      )}
    </AppShell>
  );
}