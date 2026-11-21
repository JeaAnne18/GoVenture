"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() =>
        authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/sign-in") } })
      }
      className="mt-6 rounded-full bg-[#0F5E66] px-5 py-2.5 text-sm font-medium text-white"
    >
      Sign out
    </button>
  );
}