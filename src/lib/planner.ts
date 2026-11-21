// Types and small helpers for the trip planner screen.

import type { PlaceInfo } from "./places";

export type ItemView = {
  id: string;
  day: number; // 1 = the first day of the trip
  position: number; // order inside the day
  kind: "STOP" | "NOTE";
  text: string | null; // the words of a note
  place: PlaceInfo | null; // the place of a stop
};

export type MemberView = {
  id: string;
  name: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  status: "ACCEPTED" | "PENDING";
};

export type TripView = {
  id: string;
  name: string;
  destination: string;
  destLat: number | null;
  destLng: number | null;
  startDate: string | null; // "2026-12-12"
  endDate: string | null;
  dayCount: number; // used when the trip has no dates
  canEdit: boolean;
};

// The calendar date of day number `day`, like "2026-12-13".
export function dayDate(start: string, day: number): string {
  return new Date(Date.parse(`${start}T00:00:00Z`) + (day - 1) * 86_400_000).toISOString().slice(0, 10);
}

// "2026-12-13" -> "Sun, Dec 13"
export function weekdayLabel(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}