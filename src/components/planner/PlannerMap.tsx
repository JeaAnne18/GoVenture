"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { RefObject } from "react";
import { Layer, Map as MapView, Marker, NavigationControl, Source, type MapRef } from "@vis.gl/react-maplibre";
import { MAP_STYLE, mapLib } from "@/lib/map-config";
import type { ItemView } from "@/lib/planner";
import type { PlaceInfo } from "@/lib/places";

type Props = {
  mapRef: RefObject<MapRef | null>;
  center: { lat: number; lng: number };
  zoom: number;
  stops: ItemView[]; // every stop of the trip that has a place
  activeDay: number;
  selected: PlaceInfo | null;
  nearbySaved: PlaceInfo[];
  onSelect: (place: PlaceInfo) => void;
};

export default function PlannerMap({ mapRef, center, zoom, stops, activeDay, selected, nearbySaved, onSelect }: Props) {
  const activeStops = stops.filter((s) => s.day === activeDay).sort((a, b) => a.position - b.position);
  const otherStops = stops.filter((s) => s.day !== activeDay);
  const plannedIds = new Set(stops.map((s) => s.place!.externalId));
  const line = activeStops.map((s) => [s.place!.lng, s.place!.lat]);

  return (
    <MapView
      ref={mapRef}
      mapLib={mapLib}
      mapStyle={MAP_STYLE}
      initialViewState={{ longitude: center.lng, latitude: center.lat, zoom }}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="bottom-left" />

      {line.length >= 2 && (
        <Source id="day-route" type="geojson" data={{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: line } }}>
          <Layer
            id="day-route-line"
            type="line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{ "line-color": "#F28C38", "line-width": 3, "line-dasharray": [2, 2] }}
          />
        </Source>
      )}

      {/* Saved places that are not in the plan yet: small outlined dots */}
      {nearbySaved
        .filter((p) => !plannedIds.has(p.externalId))
        .map((p) => (
          <Marker key={`saved-${p.externalId}`} longitude={p.lng} latitude={p.lat} anchor="center">
            <button type="button" onClick={() => onSelect(p)} aria-label={`Saved place: ${p.name}`} className="block size-5 rounded-full border-[3px] border-[#0F5E66] bg-white shadow" />
          </Marker>
        ))}

      {/* Stops of the other days: small grey dots */}
      {otherStops.map((s) => (
        <Marker key={`other-${s.id}`} longitude={s.place!.lng} latitude={s.place!.lat} anchor="center">
          <button type="button" onClick={() => onSelect(s.place!)} aria-label={`Day ${s.day}: ${s.place!.name}`} className="block size-3.5 rounded-full border-2 border-white bg-[#8A8E9A] shadow" />
        </Marker>
      ))}

      {/* Stops of the day she is planning: numbered circles joined by the dashed line */}
      {activeStops.map((s, i) => {
        const isSelected = selected?.externalId === s.place!.externalId;
        return (
          <Marker key={`active-${s.id}`} longitude={s.place!.lng} latitude={s.place!.lat} anchor="center">
            <button
              type="button"
              onClick={() => onSelect(s.place!)}
              aria-label={`Stop ${i + 1}: ${s.place!.name}`}
              className={`grid place-items-center rounded-full border-[3px] border-white bg-[#0F5E66] text-sm font-semibold text-white shadow-md ${
                isSelected ? "size-10 ring-4 ring-[#F28C38]/50" : "size-8"
              }`}
            >
              {i + 1}
            </button>
          </Marker>
        );
      })}

      {/* The place she is looking at, if it is not already a stop of this day */}
      {selected && !activeStops.some((s) => s.place!.externalId === selected.externalId) && (
        <Marker longitude={selected.lng} latitude={selected.lat} anchor="center">
          <span aria-hidden className="block size-6 rounded-full border-[3px] border-white bg-[#F28C38] shadow-md" />
        </Marker>
      )}
    </MapView>
  );
}