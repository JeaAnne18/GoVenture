// Helpers for showing trips. Dates are stored as UTC midnight, so we always format in UTC.

import type { PlaceInfo } from "./places";

const DAY_MS = 86_400_000;

// "Rome" + address ending in "Italy" -> "Rome, Italy"
export function destinationLabel(place: PlaceInfo): string {
  const country = place.address?.split(",").pop()?.trim();
  return country && country !== place.name ? `${place.name}, ${country}` : place.name;
}

// "2026-12-12" -> "Dec 12, 2026"
export function formatDay(day: string, withYear = true): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

// Number of days from the first day to the last day, counting both.
export function countDays(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS) + 1;
}

export function formatTripDates(start: Date | null, end: Date | null): string {
  if (!start || !end) return "Dates not set yet";
  const s = start.toISOString().slice(0, 10);
  const e = end.toISOString().slice(0, 10);
  return s.slice(0, 4) === e.slice(0, 4) ? `${formatDay(s, false)} to ${formatDay(e)}` : `${formatDay(s)} to ${formatDay(e)}`;
}

export function tripLength(start: Date | null, end: Date | null): number | null {
  if (!start || !end) return null;
  return countDays(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
}

export type TripStatus = { label: string; tone: "upcoming" | "ongoing" | "past" | "none" };

export function tripStatus(start: Date | null, end: Date | null): TripStatus {
  if (!start || !end) return { label: "Dates not set", tone: "none" };
  const now = Date.now();
  if (now < start.getTime()) {
    const days = Math.ceil((start.getTime() - now) / DAY_MS);
    return { label: days === 1 ? "Starts tomorrow" : `Starts in ${days} days`, tone: "upcoming" };
  }
  if (now < end.getTime() + DAY_MS) return { label: "Happening now", tone: "ongoing" };
  return { label: "Completed", tone: "past" };
}