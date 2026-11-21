"use client";

import { useState } from "react";
import { Bookmark, X } from "lucide-react";
import { dayDate, weekdayLabel } from "@/lib/planner";
import type { PlaceInfo } from "@/lib/places";

type Props = {
  place: PlaceInfo;
  days: number[];
  startDate: string | null;
  defaultDay: number;
  plannedDays: number[]; // days this place is already on
  saved: boolean;
  canEdit: boolean;
  onAdd: (day: number) => Promise<void>;
  onToggleSave: () => Promise<void>;
  onClose: () => void;
};

// Render with key={place.externalId} so the day picker resets for each place.
export default function PlaceCard({ place, days, startDate, defaultDay, plannedDays, saved, canEdit, onAdd, onToggleSave, onClose }: Props) {
  const [day, setDay] = useState(defaultDay);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      aria-label="Place details"
      className="absolute inset-x-4 bottom-36 z-10 rounded-3xl bg-white p-5 shadow-[0_16px_40px_-16px_rgba(43,45,51,0.4)] md:inset-x-auto md:bottom-auto md:right-4 md:top-4 md:w-[330px]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-tight">{place.name}</h2>
          {place.category && <p className="mt-0.5 text-[13px] text-[#5F6370]">{place.category}</p>}
        </div>
        <div className="-mr-2.5 -mt-2 flex shrink-0">
          <button
            type="button"
            disabled={busy}
            onClick={() => run(onToggleSave)}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved places" : "Save place"}
            className="grid size-11 place-items-center disabled:opacity-50"
          >
            <Bookmark className={`size-5 text-[#0F5E66] ${saved ? "fill-[#0F5E66]" : ""}`} aria-hidden />
          </button>
          <button type="button" onClick={onClose} aria-label="Close details" className="grid size-11 place-items-center">
            <X className="size-4 text-[#5F6370]" aria-hidden />
          </button>
        </div>
      </div>

      {place.address && <p className="mt-2 text-[13px] leading-relaxed text-[#5F6370]">{place.address}</p>}
      {plannedDays.length > 0 && (
        <p className="mt-2 inline-block rounded-full bg-[#D9ECEE] px-3 py-1 text-xs font-medium text-[#0F5E66]">
          In your plan: {plannedDays.map((d) => `Day ${d}`).join(", ")}
        </p>
      )}

      {canEdit && (
        <div className="mt-4 flex gap-2">
          <label className="sr-only" htmlFor="add-day">
            Day
          </label>
          <select
            id="add-day"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="min-h-11 min-w-0 flex-1 rounded-[14px] border border-[#D9D6E6] bg-white px-3 text-sm"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {startDate ? `Day ${d} · ${weekdayLabel(dayDate(startDate, d))}` : `Day ${d}`}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onAdd(day))}
            className="min-h-11 rounded-[14px] bg-[#0F5E66] px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            Add to Day {day}
          </button>
        </div>
      )}
    </aside>
  );
}