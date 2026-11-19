import type { SavedCompare } from "./distance";

// Shared types and helpers for the Explore Map (OpenStreetMap data via the Photon search service).

export type PlaceInfo = {
  // OpenStreetMap id like "W38862723": N = node, W = way, R = relation
  externalId: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  category: string | null;
};

export type SavedPlaceInfo = PlaceInfo & { savedId: string; note: string; compare: SavedCompare | null };

// The shape of one result from Photon (only the parts we use).
type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    housenumber?: string;
    street?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    osm_value?: string;
    osm_type?: string;
    osm_id?: number;
  };
};

function humanize(value?: string): string | null {
  if (!value || value === "yes") return null;
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function photonToPlace(feature: PhotonFeature): PlaceInfo | null {
  const p = feature.properties;
  const coords = feature.geometry?.coordinates;
  if (!p?.osm_type || !p.osm_id || !coords) return null;

  const [lng, lat] = coords;
  const street = [p.housenumber, p.street].filter(Boolean).join(" ");
  const address = [street, p.district, p.city, p.state, p.country].filter(Boolean).join(", ");

  return {
    externalId: `${p.osm_type}${p.osm_id}`,
    name: p.name ?? (street || p.city || "Unnamed place"),
    address: address || null,
    lat,
    lng,
    category: humanize(p.osm_value),
  };
}

// Link to the place's page on openstreetmap.org
export function osmUrl(externalId: string): string {
  const kind = { N: "node", W: "way", R: "relation" }[externalId.charAt(0)] ?? "node";
  return `https://www.openstreetmap.org/${kind}/${externalId.slice(1)}`;
}

// A pin dropped on the person's own location (not an OpenStreetMap place).
export function pinPlace(lat: number, lng: number, address: string | null): PlaceInfo {
  return {
    externalId: `pin:${lat.toFixed(5)},${lng.toFixed(5)}`,
    name: "Pinned location",
    address,
    lat,
    lng,
    category: "My location",
  };
}

export const isPin = (externalId: string) => externalId.startsWith("pin:");