import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatTripDates, tripLength, tripStatus } from "@/lib/trips";

type Props = {
  trip: { id: string; name: string; destination: string; startDate: Date | null; endDate: Date | null };
};

const tone = {
  upcoming: "bg-[#D9ECEE] text-[#0F5E66]",
  ongoing: "bg-[#FDE8D3] text-[#9A4A08]",
  past: "bg-[#EEEAF8] text-[#5F6370]",
  none: "bg-[#EEEAF8] text-[#5F6370]",
} as const;

export default function TripCard({ trip }: Props) {
  const status = tripStatus(trip.startDate, trip.endDate);
  const days = tripLength(trip.startDate, trip.endDate);

  return (
    <Link href={`/trips/${trip.id}`} className="block rounded-[28px] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5E66]">
    <article className="flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_8px_24px_-12px_rgba(15,94,102,0.18)]">
      <div className="flex h-28 items-end bg-gradient-to-br from-[#0F5E66] to-[#2A8790] p-5 text-white">
        <p className="flex items-center gap-2 text-lg font-semibold leading-tight">
          <MapPin className="size-5 shrink-0 text-[#F28C38]" aria-hidden />
          {trip.destination}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="text-xl font-semibold leading-tight">{trip.name}</h2>
        <p className="text-sm text-[#5F6370]">
          {formatTripDates(trip.startDate, trip.endDate)}
          {days ? ` · ${days} ${days === 1 ? "day" : "days"}` : ""}
        </p>
        <span className={`mt-auto w-fit rounded-full px-3 py-1 text-xs font-medium ${tone[status.tone]}`}>{status.label}</span>
      </div>
    </article>
    </Link>
  );
}