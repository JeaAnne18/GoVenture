"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { MapRef } from "@vis.gl/react-maplibre";
import ItineraryPanel from "./ItineraryPanel";
import PlannerMap from "./PlannerMap";
import PlaceCard from "./PlaceCard";
import SavedTray from "./SavedTray";
import PlaceSearch from "@/app/explore/PlaceSearch"; // change this path if your PlaceSearch lives somewhere else
import { addDay, addNote, addStop, moveItem, removeItem } from "@/app/trips/[id]/actions";
import { removePlace, savePlace } from "@/app/explore/actions";
import { straightLineMeters } from "@/lib/distance";
import { countDays } from "@/lib/trips";
import type { ItemView, MemberView, TripView } from "@/lib/planner";
import type { PlaceInfo, SavedPlaceInfo } from "@/lib/places";

type Props = {
  trip: TripView;
  initialItems: ItemView[];
  members: MemberView[];
  initialSaved: SavedPlaceInfo[];
};

const MANILA = { lat: 14.5995, lng: 120.9842 };
const NEARBY_KM = 150;

export default function TripPlanner({ trip, initialItems, members, initialSaved }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [items, setItems] = useState(initialItems);
  const [saved, setSaved] = useState(initialSaved);
  const [dayCount, setDayCount] = useState(trip.dayCount);
  const [activeDay, setActiveDay] = useState(1);
  const [selected, setSelected] = useState<PlaceInfo | null>(null);

  const hasDates = !!trip.startDate && !!trip.endDate;
  const daysTotal = hasDates ? countDays(trip.startDate!, trip.endDate!) : dayCount;
  const days = Array.from({ length: daysTotal }, (_, i) => i + 1);

  // Memoized so it stays the same object between renders (the search box depends on it).
  const destination = useMemo(
    () => (trip.destLat !== null && trip.destLng !== null ? { lat: trip.destLat, lng: trip.destLng } : null),
    [trip.destLat, trip.destLng],
  );
  const stops = items.filter((i) => i.kind === "STOP" && i.place);
  const firstStop = stops[0]?.place;
  const center = destination ?? (firstStop ? { lat: firstStop.lat, lng: firstStop.lng } : MANILA);

  // Which days each place is on, so the tray and the card can say "on Day 2".
  const plannedDays: Record<string, number[]> = {};
  for (const s of stops) {
    const id = s.place!.externalId;
    plannedDays[id] = [...new Set([...(plannedDays[id] ?? []), s.day])].sort((a, b) => a - b);
  }

  const nearbySaved = saved.filter((p) => !destination || straightLineMeters(destination, p) <= NEARBY_KM * 1000);

  const selectPlace = useCallback((place: PlaceInfo) => {
    setSelected(place);
    const map = mapRef.current;
    map?.flyTo({ center: [place.lng, place.lat], zoom: Math.max(map.getZoom(), 14), duration: 800 });
  }, []);

  const getBias = useCallback(() => {
    const c = mapRef.current?.getCenter();
    if (c) return { lat: c.lat, lng: c.lng };
    return destination;
  }, [destination]);

  async function handleAddStop(place: PlaceInfo, day: number) {
    try {
      const item = await addStop(trip.id, day, place);
      setItems((prev) => [...prev, item]);
      setActiveDay(day);
      toast.success(`Added to Day ${day}`);
    } catch {
      toast.error("Couldn’t add that place. Please try again.");
    }
  }

  async function handleAddNote(day: number, text: string) {
    try {
      const item = await addNote(trip.id, day, text);
      setItems((prev) => [...prev, item]);
    } catch {
      toast.error("Couldn’t save that note. Please try again.");
    }
  }

  async function handleRemove(itemId: string) {
    try {
      await removeItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch {
      toast.error("Couldn’t remove that. Please try again.");
    }
  }

  async function handleMove(itemId: string, direction: "up" | "down") {
    try {
      const otherId = await moveItem(itemId, direction);
      if (!otherId) return;
      // Trade the two positions on screen, the same way the server did.
      setItems((prev) => {
        const a = prev.find((i) => i.id === itemId);
        const b = prev.find((i) => i.id === otherId);
        if (!a || !b) return prev;
        return prev.map((i) => (i.id === a.id ? { ...i, position: b.position } : i.id === b.id ? { ...i, position: a.position } : i));
      });
    } catch {
      toast.error("Couldn’t move that. Please try again.");
    }
  }

  async function handleAddDay() {
    try {
      setDayCount(await addDay(trip.id));
    } catch {
      toast.error("Couldn’t add a day. Please try again.");
    }
  }

  async function handleToggleSave(place: PlaceInfo) {
    try {
      const existing = saved.find((p) => p.externalId === place.externalId);
      if (existing) {
        await removePlace(existing.savedId);
        setSaved((prev) => prev.filter((p) => p.externalId !== place.externalId));
        toast.success("Removed from your places");
      } else {
        const { savedId } = await savePlace(place, "", null);
        setSaved((prev) => [{ ...place, savedId, note: "", compare: null }, ...prev]);
        toast.success("Saved to your places");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-[#EEEAF8] text-[#2B2D33] md:flex-row">
      <ItineraryPanel
        trip={trip}
        members={members}
        items={items}
        days={days}
        activeDay={activeDay}
        selectedId={selected?.externalId ?? null}
        onActiveDay={setActiveDay}
        onSelectPlace={selectPlace}
        onAddNote={handleAddNote}
        onRemove={handleRemove}
        onMove={handleMove}
        onAddDay={handleAddDay}
      />

      <div className="relative min-h-0 flex-1">
        <PlannerMap
          mapRef={mapRef}
          center={center}
          zoom={destination || firstStop ? 12 : 5}
          stops={stops}
          activeDay={activeDay}
          selected={selected}
          nearbySaved={nearbySaved}
          onSelect={selectPlace}
        />

        <div className="absolute left-4 top-4 z-10 w-[min(420px,calc(100%-2rem))] rounded-full bg-white shadow-[0_8px_24px_-10px_rgba(43,45,51,0.35)] md:w-[min(420px,calc(100%-380px))]">
          <PlaceSearch
            bare
            id="planner"
            placeholder={`Search places in ${trip.destination.split(",")[0]}`}
            getBias={getBias}
            onPick={selectPlace}
            selectedPlace={selected}
            onClear={() => setSelected(null)}
          />
        </div>

        {selected && (
          <PlaceCard
            key={selected.externalId}
            place={selected}
            days={days}
            startDate={trip.startDate}
            defaultDay={activeDay}
            plannedDays={plannedDays[selected.externalId] ?? []}
            saved={saved.some((p) => p.externalId === selected.externalId)}
            canEdit={trip.canEdit}
            onAdd={(day) => handleAddStop(selected, day)}
            onToggleSave={() => handleToggleSave(selected)}
            onClose={() => setSelected(null)}
          />
        )}

        <SavedTray
          places={nearbySaved}
          plannedDays={plannedDays}
          selectedId={selected?.externalId ?? null}
          destination={trip.destination.split(",")[0]}
          onSelect={selectPlace}
        />
      </div>
    </div>
  );
}