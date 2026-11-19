"use client";

import { useEffect, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import PlaceSearch from "./PlaceSearch";
import { formatDistance, formatDuration, straightLineMeters, type RouteView, type TravelMode } from "@/lib/distance";
import type { PlaceInfo } from "@/lib/places";

const MODES: { value: TravelMode; label: string }[] = [
  { value: "foot", label: "Walk" },
  { value: "bike", label: "Cycle" },
  { value: "car", label: "Drive" },
];

type RouteResult = { key: string; distance: number; duration: number } | { key: string; failed: true };

type Props = {
  open: boolean; // controlled by the arrow in the search box
  from: PlaceInfo | null; // the place picked in the main search box above
  to: PlaceInfo | null;
  onToChange: (place: PlaceInfo | null) => void;
  mode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  onSelectFrom: (place: PlaceInfo) => void; // used by the swap button
  getBias: () => { lat: number; lng: number } | null;
  onRoute: (route: RouteView | null) => void;
};

// The lower half of the shared search box: swap button, To field, travel mode and results.
export default function DistancePanel({ open, from, to, onToChange, mode, onModeChange, onSelectFrom, getBias, onRoute }: Props) {
  const [result, setResult] = useState<RouteResult | null>(null);

  const samePlace = !!from && !!to && from.externalId === to.externalId;
  const key = from && to && !samePlace ? `${from.externalId}|${to.externalId}|${mode}` : null;

  // Ask the routing server whenever the From place, the To place or the way of travelling changes.
  useEffect(() => {
    if (!from || !to || !key) return;
    const controller = new AbortController();
    (async () => {
      try {
        const params = new URLSearchParams({
          mode,
          fromLat: String(from.lat),
          fromLon: String(from.lng),
          toLat: String(to.lat),
          toLon: String(to.lng),
        });
        const res = await fetch(`/api/route?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error("route failed");
        const data = (await res.json()) as {
          route: { distance: number; duration: number; coordinates: [number, number][] } | null;
        };
        if (!data.route) {
          setResult({ key, failed: true });
          onRoute(null);
          return;
        }
        setResult({ key, distance: data.route.distance, duration: data.route.duration });
        onRoute({ line: data.route.coordinates, from, to });
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setResult({ key, failed: true });
        onRoute(null);
      }
    })();
    return () => controller.abort();
  }, [from, to, mode, key, onRoute]);

  function clearTo() {
    onToChange(null);
    onRoute(null);
  }

  // Swapping makes the old To the new From (the map moves there) and the old From the new To.
  function swap() {
    if (!from || !to) return;
    const oldFrom = from;
    onSelectFrom(to);
    onToChange(oldFrom);
  }

  const straight = from && to && !samePlace ? straightLineMeters(from, to) : null;
  const current = result && result.key === key ? result : null;
  const loading = key !== null && !current;
  const modeLabel = MODES.find((m) => m.value === mode)?.label ?? "";

  // Stays mounted while closed, so her To place and travel mode are remembered.
  return (
    <section hidden={!open} aria-label="Distance to another place">
      <div className="flex items-center gap-2 px-3.5">
        <span className="h-px flex-1 bg-[#EEEAF8]" />
        <button
          type="button"
          onClick={swap}
          disabled={!from || !to}
          aria-label="Swap From and To"
          className="grid size-9 place-items-center rounded-full border border-[#D9D6E6] bg-white hover:bg-[#F6F4FC] disabled:opacity-40"
        >
          <ArrowDownUp className="size-4 text-[#5F6370]" aria-hidden />
        </button>
        <span className="h-px flex-1 bg-[#EEEAF8]" />
      </div>

      <PlaceSearch bare id="to" placeholder="To: search a place" onPick={onToChange} getBias={getBias} selectedPlace={to} onClear={clearTo} />

      <div className="space-y-3 px-3.5 pb-3.5 pt-1">
        <div role="group" aria-label="Way of travelling" className="flex rounded-full bg-[#EEEAF8] p-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={mode === m.value}
              onClick={() => onModeChange(m.value)}
              className={`min-h-10 flex-1 rounded-full text-[13px] font-medium ${mode === m.value ? "bg-white text-[#0F5E66]" : "text-[#5F6370]"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {!from && <p className="text-sm text-[#5F6370]">Pick a From place in the top box first.</p>}
        {samePlace && <p className="text-sm text-[#5F6370]">Pick a different place for To.</p>}

        {straight !== null && (
          <div aria-live="polite" className="space-y-1 rounded-xl bg-[#F6F4FC] p-3 text-sm">
            <p>
              Straight line: <b className="font-semibold">{formatDistance(straight)}</b>
            </p>
            {loading && <p className="text-[#5F6370]">Finding the {modeLabel.toLowerCase()} route…</p>}
            {current && "failed" in current && (
              <p className="text-[#5F6370]">No {modeLabel.toLowerCase()} route found between these places.</p>
            )}
            {current && !("failed" in current) && (
              <p>
                {modeLabel}: <b className="font-semibold">{formatDistance(current.distance)}</b>, about {formatDuration(current.duration)}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}