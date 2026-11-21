import { nearestTrip as t } from "@/lib/mock-data";
import { daysUntil, shortDate } from "@/lib/dates";

export default function NearestTripCard() {
  const daysLeft = daysUntil(t.start);
  const pct = Math.round((t.daysPlanned / t.totalDays) * 100);

  return (
    <section className="flex flex-wrap justify-between gap-6 rounded-[28px] bg-[#0F5E66] p-7 text-white shadow-[0_8px_24px_-12px_rgba(15,94,102,0.4)]">
      <div className="flex min-w-[260px] flex-col justify-between gap-8">
        <div>
          <p className="text-sm text-white/80">Your nearest trip</p>
          <h2 className="mt-1 text-7xl font-semibold leading-none tracking-tight">{t.title}</h2>
          <p className="mt-3 text-sm text-white/85">
            {shortDate(t.start)} to {shortDate(t.end)}, {t.country}
          </p>
        </div>

        <div className="max-w-xs">
          <div className="mb-2 flex justify-between text-sm">
            <span>
              {t.daysPlanned} of {t.totalDays} days planned
            </span>
            <span className="text-white/80">{pct}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Planning progress"
            className="h-2 rounded-full bg-white/20"
          >
            <div className="h-full rounded-full bg-[#F28C38]" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="min-h-11 rounded-full bg-white px-[18px] text-sm font-medium text-[#0F5E66] transition hover:bg-[#EEEAF8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Continue planning
            </button>
            <div className="flex -space-x-2" aria-label={`Shared with ${t.companions.length} people`}>
              {t.companions.map((c) => (
                <span
                  key={c}
                  className="grid size-8 place-items-center rounded-full border-2 border-[#0F5E66] bg-[#FDE8D3] text-xs font-medium text-[#2B2D33]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto size-[152px] shrink-0 -rotate-6 self-start rounded-full border-2 border-dashed border-[#F28C38] p-2">
        <div className="grid size-full place-items-center rounded-full bg-[#F28C38] text-center text-[#2B2D33]">
          <div className="leading-none">
            <div className="text-[52px] font-semibold">{daysLeft}</div>
            <div className="mt-1 text-sm font-medium">days to go</div>
          </div>
        </div>
      </div>
    </section>
  );
}