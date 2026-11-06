"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Field from "./Field";
import GoogleButton from "./GoogleButton";

export default function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const identifier = String(form.get("identifier") ?? "").trim();
    const password = String(form.get("password") ?? "");

    // An "@" means the person typed an email; otherwise treat it as a username.
    const { error } = identifier.includes("@")
      ? await authClient.signIn.email({ email: identifier, password })
      : await authClient.signIn.username({ username: identifier, password });

    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <h1 className="mt-6 text-2xl font-semibold text-[#2B2D33]">Welcome back</h1>
      <p className="mb-5 mt-1 text-sm text-[#5F6370]">Sign in to keep planning your trips.</p>

      <GoogleButton mode="sign-in" />

      <div className="my-5 flex items-center gap-3 text-[13px] text-[#5F6370]">
        <span className="h-px flex-1 bg-[#EEEAF8]" />
        or use your email
        <span className="h-px flex-1 bg-[#EEEAF8]" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <Field label="Email or username" name="identifier" autoComplete="username" required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />


        <button
          type="submit"
          disabled={loading}
          className="mt-2 min-h-12 rounded-2xl bg-[#0F5E66] text-[15px] font-medium text-white transition hover:bg-[#0F5E66]/90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5E66]"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[#5F6370]">
        New to GoVenture?{" "}
        <Link href="/sign-up" className="font-medium text-[#0F5E66] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}