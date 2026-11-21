"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useDismiss } from "@/lib/use-dismiss";

export default function ProfileMenu({ name }: { name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(open, ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="flex min-h-11 items-center gap-2.5 rounded-full bg-white py-1 pl-1 pr-3.5 text-sm font-medium shadow-[0_4px_12px_-6px_rgba(15,94,102,0.3)] focus-visible:outline-2 focus-visible:outline-[#0F5E66]"
      >
        <span className="grid size-9 place-items-center rounded-full bg-[#0F5E66] text-sm text-white">
          {name.charAt(0).toUpperCase()}
        </span>
        {name}
        <ChevronDown className="size-3.5 text-[#5F6370]" aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl bg-white p-1.5 shadow-[0_20px_48px_-16px_rgba(43,45,51,0.35)]">
          <Link href="/profile" className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-[#EEEAF8]">
            Profile
          </Link>
          <Link href="/settings" className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-[#EEEAF8]">
            Settings
          </Link>
          <button
            type="button"
            onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/sign-in") } })}
            className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-[#B3261E] hover:bg-[#EEEAF8]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}