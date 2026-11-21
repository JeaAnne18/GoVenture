import Link from "next/link";
import type { PlaceInfo } from "@/lib/places";

type Props = {
  places: PlaceInfo[];
  plannedDays: Record<string, number[]>; // externalId -> the days it is on
  selectedId: string | null;
  destination: string;
  onSelect: (place: PlaceInfo) => void;
};

export default function SavedTray({ places, plannedDays, selectedId, destination, onSelect }: Props) {
  return (
    <section aria-label="Saved places" className="absolute inset-x-4 bottom-4 z-10 rounded-3xl bg-white px-[18px] py-4 shadow-[0_16px_40px_-16px_rgba(43,45,51,0.4)]">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold">Saved places near {destination}</h2>
        <Link href="/explore" className="text-[13px] font-medium text-[#0F5E66] underline underline-offset-4">
          Open all saved places
        </Link>
      </div>

      {places.length === 0 ? (
        <p className="mt-2 text-[13px] text-[#5F6370]">Nothing saved near here yet. Search a place on the map and press the bookmark to save it.</p>
      ) : (
        <ul className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1">
          {places.map((p) => {
            const days = plannedDays[p.externalId] ?? [];
            const active = selectedId === p.externalId;
            return (
              <li key={p.externalId} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  aria-pressed={active}
                  className={`w-[190px] rounded-2xl border-2 px-3 py-2.5 text-left ${active ? "border-[#0F5E66] bg-[#D9ECEE]" : "border-transparent bg-[#F6F4FC] hover:bg-[#EEEAF8]"}`}
                >
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-[#5F6370]">
                    {[p.category, days.length ? `on ${days.map((d) => `Day ${d}`).join(", ")}` : "not planned"].filter(Boolean).join(", ")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}