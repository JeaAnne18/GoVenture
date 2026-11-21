// Whole days from now until a date like "2026-12-12". Never below 0.
export function daysUntil(date: string): number {
  return Math.max(0, Math.ceil((Date.parse(date) - Date.now()) / 86_400_000));
}

// "2026-12-12" -> "Dec 12"
export function shortDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}