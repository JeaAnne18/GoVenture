import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import DashboardSkeleton from "@/components/auth/DashboardSkeleton";
import UsernameModal from "@/components/auth/UsernameModal";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import NearestTripCard from "@/components/dashboard/NearestTripCard";
import NotesWidget from "@/components/dashboard/NotesWidget";
import TripTimeline from "@/components/dashboard/TripTimeline";
import WhereYouveBeen from "@/components/dashboard/WhereYouveBeen";
import RecentlySaved from "@/components/dashboard/RecentlySaved";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  // First-time Google users have no username yet: show the blurred skeleton and ask for one.
  if (!session.user.username) {
    return (
      <>
        <DashboardSkeleton />
        <UsernameModal email={session.user.email} />
      </>
    );
  }

  const firstName = session.user.name.split(" ")[0];

  return (
    <AppShell>
      <DashboardHeader name={firstName} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <NearestTripCard />
        <NotesWidget />
      </div>

      <TripTimeline />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <WhereYouveBeen />
        <RecentlySaved />
      </div>
    </AppShell>
  );
}