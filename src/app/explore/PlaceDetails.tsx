"use client";

import { useState } from "react";
import { Bookmark, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { isPin, osmUrl, type PlaceInfo, type SavedPlaceInfo } from "@/lib/places";
import type { SavedCompare } from "@/lib/distance";

type Props = {
  place: PlaceInfo;
  saved?: SavedPlaceInfo;
  compare: SavedCompare | null; // the distance comparison currently set in the search box, if any
  onSave: (place: PlaceInfo, note: string) => Promise<void>;
  onRemove: (savedId: string) => Promise<void>;
  onClose: () => void;
};

// Render this with key={place.externalId} so the note box resets for each place.
export default function PlaceDetails({ place, saved, compare, onSave, onRemove, onClose }: Props) {
  const [note, setNote] = useState(saved?.note ?? "");
  const [name, setName] = useState(saved?.name ?? place.name);
  const pin = isPin(place.externalId);
  // A pinned location has no real name, so she can give it one (like "Our hotel").
  const finalPlace = pin ? { ...place, name: name.trim() || "Pinned location" } : place;
  const [busy, setBusy] = useState(false);

  const compareKey = (c: SavedCompare | null) => (c ? `${c.to.externalId}|${c.mode}` : "");
  const dirty = saved
    ? note.trim() !== saved.note || (pin && finalPlace.name !== saved.name) || compareKey(compare) !== compareKey(saved.compare)
    : false;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      aria-label="Place details"
      className="absolute inset-x-4 bottom-4 z-10 max-h-[60%] overflow-y-auto rounded-3xl bg-white shadow-[0_16px_40px_-16px_rgba(43,45,51,0.4)] md:inset-x-auto md:bottom-auto md:right-4 md:top-4 md:max-h-[calc(100%-2rem)] md:w-[340px]"
    >
      <div className="grid h-20 place-items-center bg-gradient-to-br from-[#D9ECEE] to-[#FDE8D3]">
        <MapPin className="size-8 text-[#0F5E66]" aria-hidden />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight">{finalPlace.name}</h2>
            {place.category && <p className="mt-0.5 text-[13px] text-[#5F6370]">{place.category}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close details" className="-mr-2.5 -mt-2 grid size-11 shrink-0 place-items-center">
            <X className="size-4 text-[#5F6370]" aria-hidden />
          </button>
        </div>

        {place.address && <p className="mt-2.5 text-[13px] leading-relaxed text-[#5F6370]">{place.address}</p>}

        {saved && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#DDF3E8] px-3 py-1 text-[13px] font-medium text-[#0B5A3A]">
            <Bookmark className="size-3.5 fill-current" aria-hidden />
            Saved to your places
          </p>
        )}

        {pin && (
          <label className="mt-4 flex flex-col gap-1.5 text-[13px] text-[#5F6370]">
            Name this place
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="min-h-11 rounded-[14px] border border-[#D9D6E6] px-3.5 text-sm text-[#2B2D33] outline-none focus:border-[#0F5E66]"
            />
          </label>
        )}

        {compare && (
          <p className="mt-3 text-[13px] leading-relaxed text-[#5F6370]">
            The distance to <b className="font-semibold text-[#2B2D33]">{compare.to.name}</b> is saved with this place.
          </p>
        )}

        <label className="mt-4 flex flex-col gap-1.5 text-[13px] text-[#5F6370]">
          Your note
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Why you saved it, what to order, when to go…"
            className="resize-y rounded-[14px] border border-[#D9D6E6] px-3.5 py-3 text-sm leading-normal text-[#2B2D33] outline-none focus:border-[#0F5E66]"
          />
        </label>

        <div className="mt-3.5 flex gap-2">
          {saved ? (
            <>
              <button
                type="button"
                disabled={!dirty || busy}
                onClick={() => run(() => onSave(finalPlace, note))}
                className="min-h-11 flex-1 rounded-[14px] bg-[#0F5E66] text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save note"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => onRemove(saved.savedId))}
                className="min-h-11 rounded-[14px] border border-[#D9D6E6] px-4 text-sm font-medium text-[#B3261E] disabled:opacity-50"
              >
                Remove
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => onSave(finalPlace, note))}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#0F5E66] text-sm font-medium text-white disabled:opacity-50"
            >
              <Bookmark className="size-4" aria-hidden />
              {busy ? "Saving…" : "Save place"}
            </button>
          )}
        </div>

        {!pin && (
          <a
            href={osmUrl(place.externalId)}
            target="_blank"
            rel="noreferrer"
            className="mt-3.5 inline-block text-[13px] font-medium text-[#0F5E66] underline underline-offset-4"
          >
            View on OpenStreetMap
          </a>
        )}
      </div>
    </aside>
  );
}