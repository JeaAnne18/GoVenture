import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/auth/SignOutButton";
import DashboardSkeleton from "@/components/auth/DashboardSkeleton";
import UsernameModal from "@/components/auth/UsernameModal";

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

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">Hi, {session.user.name}</h1>
      <p className="mt-1 text-sm text-gray-600">You&apos;re signed in as {session.user.email}.</p>
      <SignOutButton />
    </main>
  );
}