"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Status = "idle" | "invalid" | "checking" | "available" | "taken";

const VALID = /^[A-Za-z0-9_.]{3,30}$/;

export default function UsernameModal({ email }: { email: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [checked, setChecked] = useState<{ name: string; available: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const valid = VALID.test(username);

  // Ask the server whether the name is free, 400 ms after she stops typing.
  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const { data } = await authClient.isUsernameAvailable({ username });
      if (!cancelled) setChecked({ name: username, available: !!data?.available });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username, valid]);

  let status: Status;
  if (!username) status = "idle";
  else if (!valid) status = "invalid";
  else if (checked && checked.name === username) status = checked.available ? "available" : "taken";
  else status = "checking";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "available") return;
    setSaving(true);
    const { error } = await authClient.updateUser({ username });
    if (error) {
      setSaving(false);
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    // The server re-checks the username and swaps the modal for the real dashboard.
    router.refresh();
  }

  const message: Record<Status, { text: string; tone: string } | null> = {
    idle: null,
    invalid: { text: "Use 3 to 30 letters, numbers, underscores or dots.", tone: "text-[#B3261E]" },
    checking: { text: "Checking availability…", tone: "text-[#5F6370]" },
    available: { text: `@${username} is available`, tone: "text-[#0B5A3A]" },
    taken: { text: `@${username} is already taken`, tone: "text-[#B3261E]" },
  };
  const note = message[status];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2B2D33]/40 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="username-title"
        className="w-full max-w-[500px] rounded-[28px] bg-white p-8 shadow-[0_24px_64px_-16px_rgba(43,45,51,0.5)]"
      >
        <div className="grid size-12 place-items-center rounded-2xl bg-[#FDE8D3] text-[#B85A0C]">
          <UserRound className="size-6" aria-hidden />
        </div>
        <h1 id="username-title" className="mt-4 text-2xl font-semibold text-[#2B2D33]">
          Choose your username
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#5F6370]">
          Friends use your username to invite you to their trips. You’ll need one before you can start planning.
        </p>

        <form onSubmit={onSubmit} className="mt-5">
          <label htmlFor="username" className="text-[13px] text-[#5F6370]">
            Username
          </label>
          <div className="mt-1.5 flex min-h-12 items-center gap-1 rounded-[14px] border-2 border-[#D9D6E6] px-3.5 focus-within:border-[#0F5E66]">
            <span className="text-[15px] text-[#5F6370]">@</span>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              autoFocus
              autoComplete="username"
              maxLength={30}
              aria-describedby="username-hint"
              className="min-h-11 min-w-0 flex-1 bg-transparent text-[15px] text-[#2B2D33] outline-none"
            />
          </div>

          <p id="username-hint" aria-live="polite" className={`mt-2 flex min-h-5 items-center gap-1.5 text-[13px] ${note?.tone ?? ""}`}>
            {status === "available" && <Check className="size-3.5" aria-hidden />}
            {note?.text}
          </p>
          <p className="mt-1.5 text-xs text-[#5F6370]">3 to 30 characters. Letters, numbers, underscores and dots only.</p>

          <button
            type="submit"
            disabled={status !== "available" || saving}
            className="mt-5 min-h-12 w-full rounded-2xl bg-[#0F5E66] text-[15px] font-medium text-white transition hover:bg-[#0F5E66]/90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5E66]"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#5F6370]">Signed in with Google as {email}</p>
      </div>
    </div>
  );
}