"use client";

import { Plus } from "lucide-react";
import { useNewTrip } from "./NewTripProvider";

export default function NewTripButton({ label = "New Trip" }: { label?: string }) {
  const { openNewTrip } = useNewTrip();
  return (
    <button
      type="button"
      onClick={openNewTrip}
      className="flex min-h-11 items-center gap-2 rounded-full bg-[#0F5E66] px-5 text-sm font-medium text-white transition hover:bg-[#0F5E66]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5E66]"
    >
      <Plus className="size-4" aria-hidden />
      {label}
    </button>
  );
}