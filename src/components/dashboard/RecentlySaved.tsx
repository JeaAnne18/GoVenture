import Link from "next/link";
import { Bookmark, MapPin } from "lucide-react";
import { card } from "./styles";

type RecentlySavedProps = {
  places: {
    id: string;
    name: string;
    detail: string;
  }[];
};

export default function RecentlySaved({ places }: RecentlySavedProps) {
  return (
    <section className={`${card} flex flex-col`}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Recently saved</h2>
        <Link href="/explore" className="text-sm font-medium text-[#0F5E66] underline underline-offset-4">
          View all
        </Link>
      </div>

      <ul className="mt-4 flex flex-1 flex-col gap-3">
        {places.map((p) => (
          <li key={p.id} className="flex flex-1 items-center gap-3 rounded-[18px] bg-[#F6F4FC] p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FDE8D3] text-[#B85A0C]">
              <MapPin className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="text-xs text-[#5F6370]">{p.detail}</p>
            </div>
            <button type="button" aria-label={`Add ${p.name} to a trip`} className="grid size-11 place-items-center rounded-lg hover:bg-white">
              <Bookmark className="size-[18px] fill-[#0F5E66] text-[#0F5E66]" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}