"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Layer, Map as MapView, Marker, NavigationControl, Source, type MapRef } from "@vis.gl/react-maplibre";
import { Bookmark, ChevronDown, LocateFixed, MapPin, Route } from "lucide-react";
import PlaceSearch from "./PlaceSearch";
import PlaceDetails from "./PlaceDetails";
import DistancePanel from "./DistancePanel";
import { removePlace, savePlace } from "@/app/explore/actions";
import type { RouteView, SavedCompare, TravelMode } from "@/lib/distance";
import { pinPlace, type PlaceInfo, type SavedPlaceInfo } from "@/lib/places";

// Free vector map tiles from OpenFreeMap (OpenStreetMap data, no API key).
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const MANILA = { lat: 14.5995, lng: 120.9842 };

// MapLibre 6 needs to be told where its worker file is when it runs inside Next.js.
// This loads the library in the browser only, and sets the worker before the first map is created.
const mapLib =
  typeof window === "undefined"
    ? undefined
    : import("maplibre-gl").then((m) => {
        m.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
        return m;
      });

export default function ExploreMap({ saved: initialSaved }: { saved: SavedPlaceInfo[] }) {
  const mapRef = useRef<MapRef>(null);
  const [saved, setSaved] = useState(initialSaved);
  const [selected, setSelected] = useState<PlaceInfo | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [route, setRoute] = useState<RouteView | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareTo, setCompareTo] = useState<PlaceInfo | null>(null);
  const [mode, setMode] = useState<TravelMode>("car");

  const selectPlace = useCallback((info: PlaceInfo) => {
    setSelected(info);
    const map = mapRef.current;
    map?.flyTo({ center: [info.lng, info.lat], zoom: Math.max(map.getZoom(), 14), duration: 800 });
  }, []);

  // Opening a saved place also brings back the comparison it was saved with.
  const selectSaved = useCallback(
    (p: SavedPlaceInfo) => {
      selectPlace(p);
      setCompareTo(p.compare?.to ?? null);
      if (p.compare) {
        setMode(p.compare.mode);
        setCompareOpen(true);
      }
    },
    [selectPlace],
  );

  // Shows (or clears) the route line and zooms the map to fit the whole route.
  const handleRoute = useCallback((r: RouteView | null) => {
    setRoute(r);
    if (!r) return;
    const lngs = r.line.map((c) => c[0]);
    const lats = r.line.map((c) => c[1]);
    mapRef.current?.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: { top: 80, bottom: 80, left: 80, right: 380 }, duration: 800 },
    );
  }, []);

  const getBias = useCallback(() => {
    const c = mapRef.current?.getCenter();
    return c ? { lat: c.lat, lng: c.lng } : null;
  }, []);

  // Asks the browser for her position, shows a blue dot, and pins it so she can save it with a note.
  function locateMe() {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser doesn’t support location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setMe({ lat, lng });
        let address: string | null = null;
        try {
          const res = await fetch(`/api/places/reverse?lat=${lat}&lon=${lng}`);
          if (res.ok) address = ((await res.json()) as { address: string | null }).address;
        } catch {
          // No address is fine. The pin still works.
        }
        selectPlace(pinPlace(lat, lng, address));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(
          err.code === err.PERMISSION_DENIED
            ? "Location access is blocked. Allow it in your browser’s site settings, then try again."
            : "Couldn’t get your location. Please try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  // The route belongs to the place that is open. Closing the card or picking another place hides it.
  const shownRoute = compareOpen && route && selected && route.from.externalId === selected.externalId ? route : null;

  const savedMatch = selected ? saved.find((p) => p.externalId === selected.externalId) : undefined;

  async function handleSave(place: PlaceInfo, note: string) {
    // Keep the To place and travel mode with the saved place, unless To is the place itself.
    const compare: SavedCompare | null = compareTo && compareTo.externalId !== place.externalId ? { to: compareTo, mode } : null;
    const { savedId } = await savePlace(place, note, compare);
    const cleanNote = note.trim();
    setSaved((prev) =>
      prev.some((p) => p.externalId === place.externalId)
        ? prev.map((p) => (p.externalId === place.externalId ? { ...p, note: cleanNote, savedId, compare } : p))
        : [{ ...place, savedId, note: cleanNote, compare }, ...prev],
    );
    toast.success(savedMatch ? "Note saved" : "Saved to your places");
  }

  async function handleRemove(savedId: string) {
    await removePlace(savedId);
    setSaved((prev) => prev.filter((p) => p.savedId !== savedId));
    toast.success("Removed from your places");
  }

  const start = initialSaved[0] ?? MANILA;
  const pin = (active: boolean, name: string, onClick?: () => void) => (
    <button type="button" onClick={onClick} aria-label={name} className="block -translate-y-px focus-visible:outline-2 focus-visible:outline-[#0F5E66]">
      <MapPin
        className={`drop-shadow-md ${active ? "size-11 fill-[#F28C38]" : "size-9 fill-[#0F5E66]"} text-white`}
        aria-hidden
      />
    </button>
  );

  return (
    <div className="flex h-[100dvh] flex-col md:h-screen md:flex-row">
      <aside className="z-10 flex max-h-[45vh] w-full shrink-0 flex-col gap-4 overflow-y-auto bg-white p-5 pt-16 md:max-h-none md:w-[380px] md:pt-6">
        <div>
          <h1 className="text-2xl font-semibold">Explore Map</h1>
          <p className="mt-1 text-sm text-[#5F6370]">Search a place, save it, and add a note.</p>
        </div>

        {/* One shared box: the search field on top is From, and the arrow opens To, travel mode and results below it */}
        <div className="rounded-2xl border-2 border-[#D9D6E6] bg-white focus-within:border-[#0F5E66]">
          <PlaceSearch
            bare
            onPick={selectPlace}
            getBias={getBias}
            selectedPlace={selected}
            onClear={() => setSelected(null)}
            placeholder={compareOpen ? "From: search a place" : undefined}
            trailing={
              <button
                type="button"
                onClick={() => setCompareOpen((o) => !o)}
                aria-expanded={compareOpen}
                aria-label="Compare distance to another place"
                title="Compare distance to another place"
                className="flex min-h-11 items-center gap-0.5 rounded-xl px-2.5 text-[#0F5E66] hover:bg-[#F6F4FC]"
              >
                <Route className="size-4" aria-hidden />
                <ChevronDown className={`size-4 transition ${compareOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
            }
          />
          <DistancePanel
            open={compareOpen}
            from={selected}
            to={compareTo}
            onToChange={setCompareTo}
            mode={mode}
            onModeChange={setMode}
            onSelectFrom={selectPlace}
            getBias={getBias}
            onRoute={handleRoute}
          />
        </div>

        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#D9D6E6] text-sm font-medium text-[#0F5E66] hover:bg-[#F6F4FC] disabled:opacity-60"
        >
          <LocateFixed className="size-4" aria-hidden />
          {locating ? "Finding you…" : "Pin my current location"}
        </button>


        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Saved places</h2>
          <span className="text-[13px] text-[#5F6370]">{saved.length} saved</span>
        </div>

        {saved.length === 0 ? (
          <p className="rounded-2xl bg-[#F6F4FC] p-4 text-sm text-[#5F6370]">
            Nothing saved yet. Search for a place above, then press Save place.
          </p>
        ) : (
          <ul className="-mx-1 min-h-[160px] flex-1 space-y-2.5 overflow-y-auto px-1 pb-1">
            {saved.map((p) => {
              const active = selected?.externalId === p.externalId;
              return (
                <li key={p.externalId}>
                  <button
                    type="button"
                    onClick={() => selectSaved(p)}
                    aria-pressed={active}
                    className={`w-full rounded-[18px] border-2 px-3.5 py-3 text-left transition ${
                      active ? "border-[#0F5E66] bg-[#D9ECEE]" : "border-transparent bg-[#F6F4FC] hover:bg-[#EEEAF8]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-semibold">{p.name}</span>
                      <Bookmark className="size-[18px] shrink-0 fill-[#0F5E66] text-[#0F5E66]" aria-hidden />
                    </span>
                    {p.category && <span className="mt-0.5 block text-xs text-[#5F6370]">{p.category}</span>}
                    {p.note && <span className="mt-1.5 line-clamp-2 block text-[13px] leading-snug">{p.note}</span>}
                    {p.compare && <span className="mt-1.5 block text-xs text-[#0F5E66]">Distance to {p.compare.to.name}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <div className="relative min-h-0 flex-1">
        <MapView
          ref={mapRef}
          mapLib={mapLib}
          mapStyle={MAP_STYLE}
          initialViewState={{ longitude: start.lng, latitude: start.lat, zoom: initialSaved[0] ? 12 : 5 }}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="bottom-left" />

          {shownRoute && (
            <>
              <Source
                id="route"
                type="geojson"
                data={{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: shownRoute.line } }}
              >
                <Layer
                  id="route-line"
                  type="line"
                  layout={{ "line-cap": "round", "line-join": "round" }}
                  paint={{ "line-color": "#0F5E66", "line-width": 5, "line-opacity": 0.85 }}
                />
              </Source>
              {([["A", shownRoute.from], ["B", shownRoute.to]] as const).map(([letter, p]) => (
                <Marker key={letter} longitude={p.lng} latitude={p.lat} anchor="center">
                  <span role="img" aria-label={`${letter === "A" ? "From" : "To"}: ${p.name}`} className="grid size-7 place-items-center rounded-full border-2 border-white bg-[#0F5E66] text-xs font-semibold text-white shadow">
                    {letter}
                  </span>
                </Marker>
              ))}
            </>
          )}

          {me && (
            <Marker longitude={me.lng} latitude={me.lat} anchor="center">
              <span role="img" aria-label="You are here" className="relative grid size-5 place-items-center">
                <span className="absolute size-5 animate-ping rounded-full bg-[#2F7BF5]/40" />
                <span className="size-3.5 rounded-full border-2 border-white bg-[#2F7BF5] shadow" />
              </span>
            </Marker>
          )}

          {saved.map((p) => (
            <Marker key={p.externalId} longitude={p.lng} latitude={p.lat} anchor="bottom">
              {pin(selected?.externalId === p.externalId, p.name, () => selectSaved(p))}
            </Marker>
          ))}

          {selected && !savedMatch && (
            <Marker longitude={selected.lng} latitude={selected.lat} anchor="bottom">
              {pin(true, selected.name)}
            </Marker>
          )}
        </MapView>

        {selected && (
          <PlaceDetails
            key={selected.externalId}
            place={selected}
            saved={savedMatch}
            compare={compareTo && compareTo.externalId !== selected.externalId ? { to: compareTo, mode } : null}
            onSave={handleSave}
            onRemove={handleRemove}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}