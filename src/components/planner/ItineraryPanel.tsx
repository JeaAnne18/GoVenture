"use client";

import { useState } from "react";
import Link from "next/link";
import { AlignLeft, ChevronDown, ChevronLeft, ChevronUp, Plus, X } from "lucide-react";
import { dayDate, initials, weekdayLabel, type ItemView, type MemberView, type TripView } from "@/lib/planner";
import { formatDay } from "@/lib/trips";
import type { PlaceInfo } from "@/lib/places";

type Props = {
  trip: TripView;
  members: MemberView[];
  items: ItemView[];
  days: number[];
  activeDay: number;
  selectedId: string | null;
  onActiveDay: (day: number) => void;
  onSelectPlace: (place: PlaceInfo) => void;
  onAddNote: (day: number, text: string) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  onMove: (itemId: string, direction: "up" | "down") => Promise<void>;
  onAddDay: () => Promise<void>;
};

const iconButton =
  "grid size-9 shrink-0 place-items-center rounded-full text-[#5F6370] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent";

function ItemActions({ first, last, onUp, onDown, onRemove }: { first: boolean; last: boolean; onUp: () => void; onDown: () => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 items-center pr-1">
      <button type="button" onClick={onUp} disabled={first} aria-label="Move up" className={iconButton}>
        <ChevronUp className="size-4" aria-hidden />
      </button>
      <button type="button" onClick={onDown} disabled={last} aria-label="Move down" className={iconButton}>
        <ChevronDown className="size-4" aria-hidden />
      </button>
      <button type="button" onClick={onRemove} aria-label="Remove" className={iconButton}>
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function NoteForm({ onSave, onCancel }: { onSave: (text: string) => Promise<void>; onCancel: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    await onSave(text);
    setBusy(false);
  }

  return (
    <div className="rounded-2xl bg-[#FFF4E8] p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        rows={3}
        maxLength={1000}
        aria-label="Note"
        placeholder="Write a note for this day…"
        className="w-full resize-y rounded-xl border border-[#F1D5B8] bg-white px-3 py-2 text-sm outline-none focus:border-[#0F5E66]"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="min-h-10 rounded-full px-4 text-sm font-medium hover:bg-white">
          Cancel
        </button>
        <button type="button" disabled={busy || !text.trim()} onClick={submit} className="min-h-10 rounded-full bg-[#0F5E66] px-5 text-sm font-medium text-white disabled:opacity-50">
          {busy ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}

export default function ItineraryPanel({
  trip,
  members,
  items,
  days,
  activeDay,
  selectedId,
  onActiveDay,
  onSelectPlace,
  onAddNote,
  onRemove,
  onMove,
  onAddDay,
}: Props) {
  const [noteDay, setNoteDay] = useState<number | null>(null);
  const hasDates = !!trip.startDate && !!trip.endDate;
  const dateText = hasDates ? `${formatDay(trip.startDate!, false)} to ${formatDay(trip.endDate!)}` : "Dates not set";

  return (
    <aside className="z-10 flex max-h-[50vh] w-full shrink-0 flex-col bg-white md:max-h-none md:w-[400px]">
      <div className="px-6 pt-5">
        <Link href="/trips" className="inline-flex min-h-9 items-center gap-1 text-[13px] font-medium text-[#0F5E66]">
          <ChevronLeft className="size-4" aria-hidden />
          My Trips
        </Link>

        <div className="mt-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold">{trip.name}</h1>
            <p className="mt-0.5 text-[13px] text-[#5F6370]">
              {trip.destination} · {dateText}
            </p>
          </div>
          <ul className="flex shrink-0 -space-x-2" aria-label={`${members.length} people on this trip`}>
            {members.slice(0, 4).map((m) => (
              <li
                key={m.id}
                title={m.status === "PENDING" ? `${m.name} (invitation pending)` : m.name}
                className={`grid size-8 place-items-center rounded-full border-2 border-white bg-[#FDE8D3] text-xs font-medium ${m.status === "PENDING" ? "opacity-60" : ""}`}
              >
                {initials(m.name)}
              </li>
            ))}
          </ul>
        </div>

        <div role="tablist" className="mt-4 flex gap-1 border-b border-[#EEEAF8]">
          <button role="tab" aria-selected="true" className="min-h-11 border-b-[3px] border-[#0F5E66] px-3.5 text-sm font-semibold text-[#0F5E66]">
            Itinerary
          </button>
          <button role="tab" aria-selected="false" disabled title="Coming in the next step" className="min-h-11 border-b-[3px] border-transparent px-3.5 text-sm font-medium text-[#8A8E9A]">
            Notes
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
        {days.map((day) => {
          const dayItems = items.filter((i) => i.day === day).sort((a, b) => a.position - b.position);
          let stopNumber = 0;
          const active = day === activeDay;

          return (
            <section key={day} aria-label={`Day ${day}`}>
              <button
                type="button"
                onClick={() => onActiveDay(day)}
                aria-current={active ? "true" : undefined}
                className="flex min-h-10 w-full items-baseline justify-between text-left"
              >
                <h2 className={`text-base font-semibold ${active ? "text-[#0F5E66]" : ""}`}>Day {day}</h2>
                {hasDates && <span className="text-[13px] text-[#5F6370]">{weekdayLabel(dayDate(trip.startDate!, day))}</span>}
              </button>

              <ul className="mt-1.5 space-y-2 text-sm">
                {dayItems.map((item, index) => {
                  const first = index === 0;
                  const last = index === dayItems.length - 1;
                  const actions = trip.canEdit && (
                    <ItemActions
                      first={first}
                      last={last}
                      onUp={() => onMove(item.id, "up")}
                      onDown={() => onMove(item.id, "down")}
                      onRemove={() => onRemove(item.id)}
                    />
                  );

                  if (item.kind === "NOTE") {
                    return (
                      <li key={item.id} className="flex items-start gap-1 rounded-2xl bg-[#FFF4E8] pl-3.5">
                        <AlignLeft className="mt-3.5 size-4 shrink-0 text-[#9A4A08]" aria-label="Note" role="img" />
                        <p className="min-h-12 flex-1 whitespace-pre-wrap py-3 pl-1 text-[13px] leading-relaxed">{item.text}</p>
                        {actions}
                      </li>
                    );
                  }

                  stopNumber += 1;
                  const place = item.place;
                  if (!place) return null;
                  const selected = selectedId === place.externalId;
                  return (
                    <li key={item.id} className={`flex items-center gap-1 rounded-2xl ${selected ? "bg-[#D9ECEE] outline outline-2 outline-[#0F5E66]" : "bg-[#F6F4FC]"}`}>
                      <button type="button" onClick={() => onSelectPlace(place)} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-3.5 text-left">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#0F5E66] text-xs font-semibold text-white">{stopNumber}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{place.name}</span>
                          {place.category && <span className="block truncate text-xs text-[#5F6370]">{place.category}</span>}
                        </span>
                      </button>
                      {actions}
                    </li>
                  );
                })}

                {dayItems.length === 0 && noteDay !== day && (
                  <li className="rounded-2xl border-2 border-dashed border-[#C9C4DD] px-3.5 py-4 text-center text-[13px] text-[#5F6370]">
                    Nothing planned yet. Search the map or pick a saved place to add a stop.
                  </li>
                )}

                {noteDay === day && (
                  <li>
                    <NoteForm
                      onCancel={() => setNoteDay(null)}
                      onSave={async (text) => {
                        await onAddNote(day, text);
                        setNoteDay(null);
                      }}
                    />
                  </li>
                )}
              </ul>

              {trip.canEdit && noteDay !== day && (
                <button
                  type="button"
                  onClick={() => setNoteDay(day)}
                  className="mt-2 flex min-h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#0F5E66] hover:bg-[#EEEAF8]"
                >
                  <Plus className="size-3.5" aria-hidden />
                  Add note
                </button>
              )}
            </section>
          );
        })}

        {trip.canEdit && !hasDates && (
          <button type="button" onClick={onAddDay} className="min-h-11 w-full rounded-2xl border border-[#D9D6E6] text-sm font-medium text-[#0F5E66] hover:bg-[#F6F4FC]">
            Add another day
          </button>
        )}
      </div>
    </aside>
  );
}