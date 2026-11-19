"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MapPin, Search, X } from "lucide-react";
import type { PlaceInfo } from "@/lib/places";

type Props = {
  onPick: (place: PlaceInfo) => void;
  // Lets the search prefer places near the part of the map she is looking at.
  getBias: () => { lat: number; lng: number } | null;
  placeholder?: string;
  id?: string; // use a different id when there are several search boxes on the page
  trailing?: ReactNode; // a button shown inside the box, at the right edge
  selectedPlace?: PlaceInfo | null; // shown in the box whenever she isn't typing
  onClear?: () => void; // called when she presses the X
  bare?: boolean; // no border of its own, for use inside a larger shared box
};

export default function PlaceSearch({
  onPick,
  getBias,
  placeholder = "Search places, like “Kyoto cafes”",
  id = "place",
  trailing,
  selectedPlace,
  onClear,
  bare = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceInfo[]>([]);
  const [open, setOpen] = useState(false);

  // While she types we show her text. Otherwise we show the place that is picked.
  const inputValue = editing ? query : (selectedPlace?.name ?? "");

  // Ask our search route 350 ms after she stops typing. The wait keeps us within Photon's fair-use limits.
  useEffect(() => {
    if (!editing || query.trim().length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim() });
        const bias = getBias();
        if (bias) {
          params.set("lat", String(bias.lat));
          params.set("lon", String(bias.lng));
        }
        const res = await fetch(`/api/places/search?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { results: PlaceInfo[] };
        setSuggestions(data.results);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setSuggestions([]);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, editing, getBias]);

  const visible = editing && query.trim().length >= 3 ? suggestions : [];

  function pick(place: PlaceInfo) {
    onPick(place);
    setEditing(false);
    setQuery("");
    setOpen(false);
  }

  function clear() {
    setEditing(false);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    onClear?.();
  }

  const rowClass = bare
    ? "flex min-h-12 items-center gap-2.5 px-3.5"
    : "flex min-h-12 items-center gap-2.5 rounded-2xl border-2 border-[#D9D6E6] px-3.5 focus-within:border-[#0F5E66]";

  return (
    <div className="relative">
      <div className={rowClass}>
        <Search className="size-[18px] shrink-0 text-[#5F6370]" aria-hidden />
        <input
          value={inputValue}
          onChange={(e) => {
            setEditing(true);
            setQuery(e.target.value);
          }}
          onFocus={(e) => {
            setOpen(true);
            e.currentTarget.select();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setEditing(false);
            }
          }}
          role="combobox"
          aria-expanded={open && visible.length > 0}
          aria-controls={`${id}-suggestions`}
          aria-label={placeholder}
          placeholder={placeholder}
          className="min-h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none"
        />
        {inputValue && (
          <button type="button" onClick={clear} aria-label="Clear search" className="grid size-11 shrink-0 place-items-center">
            <X className="size-4 text-[#5F6370]" aria-hidden />
          </button>
        )}
        {trailing && <div className="-mr-2.5 shrink-0">{trailing}</div>}
      </div>

      {open && visible.length > 0 && (
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-[0_20px_48px_-16px_rgba(43,45,51,0.35)]"
        >
          {visible.map((p) => (
            <li key={p.externalId} role="option" aria-selected={false}>
              <button type="button" onClick={() => pick(p)} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-[#EEEAF8]">
                <MapPin className="size-4 shrink-0 text-[#B85A0C]" aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-[#5F6370]">{p.address ?? p.category}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}