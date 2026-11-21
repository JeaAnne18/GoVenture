import { trips } from "@/lib/mock-data";
import { shortDate } from "@/lib/dates";
import { card } from "./styles";

// Six months shown: Nov 2026 to Apr 2027.
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
const RANGE_START = Date.UTC(2026, 10, 1);
const RANGE_END = Date.UTC(2027, 4, 1);

const position = (date: string) => ((Date.parse(date) - RANGE_START) / (RANGE_END - RANGE_START)) * 100;

export default function TripTimeline() {
  return (
    <section className={card}>
      <h2 className="text-lg font-semibold">Trip timeline</h2>

      <div className="mt-5 grid grid-cols-6 text-[13px] text-[#5F6370]">
        {MONTHS.map((m) => (
          <span key={m} className="border-l border-[#EEEAF8] pl-2">
            {m}
          </span>
        ))}
      </div>

      <div className="relative mt-3 h-28 overflow-hidden">
        {trips.map((t) => (
          <div
            key={t.id}
            className={`absolute w-44 rounded-2xl px-3.5 py-2.5 text-sm ${t.tone === "teal" ? "bg-[#D9ECEE]" : "bg-[#FDE8D3]"}`}
            style={{ left: `${Math.min(position(t.start), 80)}%`, top: t.row * 56 }}
          >
            <div className={`font-medium ${t.tone === "teal" ? "text-[#0F5E66]" : "text-[#2B2D33]"}`}>{t.title}</div>
            <div className="text-xs text-[#5F6370]">
              {shortDate(t.start)} to {shortDate(t.end)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}