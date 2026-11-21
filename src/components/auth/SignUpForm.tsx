"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Field from "./Field";
import GoogleButton from "./GoogleButton";

export default function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    // Better Auth stores a name for every user, so we reuse the username.
    // People can set a friendlier display name later on their profile.
    const { error } = await authClient.signUp.email({
      name: username,
      username,
      email,
      password,
    });

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
      <h1 className="mt-6 text-2xl font-semibold text-[#2B2D33]">Create your account</h1>
      <p className="mb-5 mt-1 text-sm text-[#5F6370]">Your username lets friends invite you to their trips.</p>

      <GoogleButton mode="sign-up" />

      <div className="my-5 flex items-center gap-3 text-[13px] text-[#5F6370]">
        <span className="h-px flex-1 bg-[#EEEAF8]" />
        or use your email
        <span className="h-px flex-1 bg-[#EEEAF8]" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <Field
          label="Username"
          name="username"
          autoComplete="username"
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9_.]+"
          title="Letters, numbers, underscores and dots only"
          required
        />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          required
        />


        <button
          type="submit"
          disabled={loading}
          className="mt-2 min-h-12 rounded-2xl bg-[#0F5E66] text-[15px] font-medium text-white transition hover:bg-[#0F5E66]/90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5E66]"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[#5F6370]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-[#0F5E66] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}