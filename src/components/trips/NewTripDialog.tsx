"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import PlaceSearch from "@/app/explore/PlaceSearch"; 
import RangeCalendar from "./RangeCalendar";
import InvitePicker, { type InviteUser } from "./InvitePicker";
import { createTrip } from "@/app/trips/actions";
import { countDays, destinationLabel, formatDay } from "@/lib/trips";
import type { PlaceInfo } from "@/lib/places";

function NewTripForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [unknownDates, setUnknownDates] = useState(false);
  const [invites, setInvites] = useState<InviteUser[]>([]);
  const [saving, setSaving] = useState(false);

  const noBias = useCallback(() => null, []);
  const datesReady = unknownDates || (!!start && !!end);
  const canCreate = name.trim().length > 0 && !!place && datesReady && !saving;

  let summary = "Pick your start date, then your end date.";
  if (unknownDates) summary = "No dates yet. You can add them later.";
  else if (start && end) {
    const n = countDays(start, end);
    summary = `${n} ${n === 1 ? "day" : "days"}, ${formatDay(start, false)} to ${formatDay(end, false)}.`;
  } else if (start) summary = "Now pick your end date.";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!place || !canCreate) return;
    setSaving(true);

    const result = await createTrip({
      name,
      destination: destinationLabel(place),
      destLat: place.lat,
      destLng: place.lng,
      startDate: unknownDates ? null : start,
      endDate: unknownDates ? null : end,
      inviteUserIds: invites.map((u) => u.id),
    });

    if (!result.ok) {
      setSaving(false);
      toast.error(result.error);
      return;
    }
    toast.success("Trip created");
    onClose();
    router.push(`/trips/${result.id}`); // straight into the planner
  }

  const readOnlyField =
    "min-h-11 w-full rounded-[14px] border-2 border-[#0F5E66] bg-white px-3.5 text-[15px] text-[#2B2D33] outline-none placeholder:text-[#8A8E9A] disabled:border-[#D9D6E6]";

  return (
    <form onSubmit={onSubmit} className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 id="new-trip-title" className="text-2xl font-semibold">
            Plan a new trip
          </h1>
          <p className="mt-1 text-sm text-[#5F6370]">You can change all of this later.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 grid size-11 place-items-center rounded-full hover:bg-[#EEEAF8]">
          <X className="size-5 text-[#5F6370]" aria-hidden />
        </button>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-[13px] text-[#5F6370]">
            Trip name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoFocus
              placeholder="Rome December trip"
              className="min-h-12 rounded-[14px] border border-[#D9D6E6] px-3.5 text-[15px] text-[#2B2D33] outline-none focus:border-[#0F5E66]"
            />
          </label>

          <div className="flex flex-col gap-1.5 text-[13px] text-[#5F6370]">
            <span>Where are you going?</span>
            <div className="rounded-[14px] border-2 border-[#D9D6E6] focus-within:border-[#0F5E66]">
              <PlaceSearch
                bare
                id="trip-destination"
                placeholder="Search a city or place"
                getBias={noBias}
                onPick={setPlace}
                selectedPlace={place}
                onClear={() => setPlace(null)}
              />
            </div>
            <span className="text-xs">Start typing to search places. The map will open centered here.</span>
          </div>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1.5 text-[13px] text-[#5F6370]">
              Start date
              <input readOnly disabled={unknownDates} value={start && !unknownDates ? formatDay(start) : ""} placeholder="Pick on calendar" className={readOnlyField} />
            </label>
            <label className="flex flex-1 flex-col gap-1.5 text-[13px] text-[#5F6370]">
              End date
              <input readOnly disabled={unknownDates} value={end && !unknownDates ? formatDay(end) : ""} placeholder="Pick on calendar" className={readOnlyField} />
            </label>
          </div>

          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={unknownDates}
              onChange={(e) => setUnknownDates(e.target.checked)}
              className="size-5 accent-[#0F5E66]"
            />
            I don’t know the dates yet
          </label>

          <div className="flex flex-col gap-1.5 text-[13px] text-[#5F6370]">
            <span>Invite travel companions (optional)</span>
            <InvitePicker value={invites} onChange={setInvites} dropUp />
          </div>
        </div>

        <div>
          <RangeCalendar
            start={start}
            end={end}
            disabled={unknownDates}
            onChange={(s, e) => {
              setStart(s);
              setEnd(e);
            }}
          />
          <p aria-live="polite" className="mt-3 text-center text-[13px] text-[#5F6370]">
            {summary}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="min-h-12 rounded-full border border-[#D9D6E6] bg-white px-6 text-sm font-medium hover:bg-[#F6F4FC]">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canCreate}
          className="min-h-12 rounded-full bg-[#0F5E66] px-7 text-sm font-medium text-white hover:bg-[#0F5E66]/90 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create trip"}
        </button>
      </div>
    </form>
  );
}

type Props = { open: boolean; onClose: () => void };

// Uses the browser's built-in <dialog>: it dims the page, traps the keyboard focus inside, and closes on Escape.
export default function NewTripDialog({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()} // a click on the dimmed backdrop closes it
      aria-labelledby="new-trip-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(820px,calc(100vw-2rem))] overflow-y-auto rounded-[28px] bg-white p-0 text-[#2B2D33] shadow-[0_24px_64px_-16px_rgba(43,45,51,0.5)] backdrop:bg-[#2B2D33]/50 backdrop:backdrop-blur-sm"
    >
      {/* Only mounted while open, so the form starts empty every time */}
      {open && <NewTripForm onClose={onClose} />}
    </dialog>
  );
}