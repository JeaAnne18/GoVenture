"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

// Better Auth sends people back here with ?error=<code> when a Google sign-in fails.
const messages: Record<string, string> = {
  account_exists: "Account already exists. Please sign in.",
  signup_disabled: "We couldn’t find an account for that Google profile. Create an account first.",
  unable_to_create_user: "We couldn’t create your account with Google. Please try again.",
  access_denied: "Google sign-in was cancelled.",
  account_not_linked: "This email already has an account. Sign in with your email and password instead.",
  email_not_found: "Google didn’t share an email address, so we couldn’t sign you in.",
  state_mismatch: "Your sign-in session expired. Please try again.",
};

export default function AuthErrorToast() {
  const router = useRouter();
  const code = useSearchParams().get("error");

  useEffect(() => {
    if (!code) return;
    // Google signed her in before we could tell the account already existed, so undo that.
    if (code === "account_exists") void authClient.signOut();

    const text = messages[code] ?? "Something went wrong signing you in. Please try again.";
    toast.error(text, {
      id: "auth-error", // same id means the toast never shows twice
      action:
        code === "signup_disabled"
          ? { label: "Create account", onClick: () => router.push("/sign-up") }
          : code === "account_exists"
            ? { label: "Sign in", onClick: () => router.push("/sign-in") }
            : undefined,
    });
  }, [code, router]);

  return null;
}