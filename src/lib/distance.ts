import type { PlaceInfo } from "./places";

export type TravelMode = "foot" | "bike" | "car";

// The comparison saved with a place: where the distance goes to, and how she planned to travel.
export type SavedCompare = { to: PlaceInfo; mode: TravelMode };

// Reads the compare data back from the database safely (it is stored as JSON).
export function parseCompare(value: unknown): SavedCompare | null {
  if (!value || typeof value !== "object") return null;
  const v = value as { to?: Partial<PlaceInfo>; mode?: unknown };
  const to = v.to;
  if (!to || typeof to.externalId !== "string" || typeof to.name !== "string") return null;
  if (typeof to.lat !== "number" || typeof to.lng !== "number") return null;
  if (v.mode !== "foot" && v.mode !== "bike" && v.mode !== "car") return null;
  return {
    to: {
      externalId: to.externalId,
      name: to.name,
      address: typeof to.address === "string" ? to.address : null,
      lat: to.lat,
      lng: to.lng,
      category: typeof to.category === "string" ? to.category : null,
    },
    mode: v.mode,
  };
}

// A route drawn on the map, with the two places it joins.
export type RouteView = {
  line: [number, number][]; // [longitude, latitude] points along the route
  from: PlaceInfo;
  to: PlaceInfo;
};

// Straight-line ("as the crow flies") distance in meters, using the haversine formula.
export function straightLineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${Math.max(minutes, 1)} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}