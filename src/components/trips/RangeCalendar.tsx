"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  start: string | null; // "2026-12-12"
  end: string | null;
  onChange: (start: string | null, end: string | null) => void;
  disabled?: boolean;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad = (n: number) => String(n).padStart(2, "0");
const toDay = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export default function RangeCalendar({ start, end, onChange, disabled = false }: Props) {
  // The month being shown. It starts on the start date's month, or this month.
  const [view, setView] = useState(() => {
    const d = start ? new Date(`${start}T00:00:00Z`) : new Date();
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });

  const firstWeekday = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const label = new Date(Date.UTC(view.y, view.m, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function shift(by: number) {
    setView((v) => {
      const d = new Date(Date.UTC(v.y, v.m + by, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
  }

  // First click sets the start. The next click on a later day sets the end. Clicking earlier starts over.
  function pick(day: string) {
    if (!start || end) onChange(day, null);
    else if (day < start) onChange(day, null);
    else onChange(start, day);
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-40" : ""} aria-disabled={disabled}>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="grid size-11 place-items-center rounded-full hover:bg-[#EEEAF8]">
          <ChevronLeft className="size-[18px]" aria-hidden />
        </button>
        <div className="text-[15px] font-semibold" aria-live="polite">
          {label}
        </div>
        <button type="button" onClick={() => shift(1)} aria-label="Next month" className="grid size-11 place-items-center rounded-full hover:bg-[#EEEAF8]">
          <ChevronRight className="size-[18px]" aria-hidden />
        </button>
      </div>

      <div className="mt-1 grid grid-cols-7 text-center text-xs text-[#5F6370]">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-y-0.5 text-center text-sm">
        {Array.from({ length: firstWeekday }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const day = toDay(view.y, view.m, d);
          const isStart = day === start;
          const isEnd = day === end;
          const inRange = !!start && !!end && day > start && day < end;

          let shape = "";
          if (isStart && isEnd) shape = "rounded-full";
          else if (isStart) shape = end ? "rounded-l-full" : "rounded-full";
          else if (isEnd) shape = "rounded-r-full";

          const color =
            isStart || isEnd
              ? "bg-[#0F5E66] font-semibold text-white"
              : inRange
                ? "bg-[#D9ECEE] text-[#0F5E66]"
                : "hover:bg-[#EEEAF8]";

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => pick(day)}
              aria-pressed={isStart || isEnd}
              aria-label={new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { dateStyle: "full", timeZone: "UTC" })}
              className={`h-11 ${shape} ${color}`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}