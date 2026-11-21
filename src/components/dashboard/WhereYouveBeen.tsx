import { ChevronDown, Minus, Plus } from "lucide-react";
import { mapStats as s } from "@/lib/mock-data";
import { card } from "./styles";

// Stylized placeholder map. Swap the <svg> for a real map (Google Maps) later.
export default function WhereYouveBeen() {
  const stats = [
    [s.travelDays, "Travel days"],
    [s.countriesVisited, "Countries visited"],
    [s.tripsPlanned, "Trips planned"],
  ] as const;

  return (
    <section className={card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Where you’ve been</h2>
        <button type="button" className="flex min-h-11 items-center gap-1.5 rounded-full border border-[#D9D6E6] bg-white px-3.5 text-[13px] font-medium">
          All countries
          <ChevronDown className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-5">
        <dl className="flex min-w-[120px] flex-col justify-center gap-5">
          {stats.map(([value, label]) => (
            <div key={label}>
              <dd className="text-4xl font-semibold leading-none text-[#0F5E66]">{value}</dd>
              <dt className="mt-1 text-[13px] text-[#5F6370]">{label}</dt>
            </div>
          ))}
        </dl>

        <div className="relative min-w-[300px] flex-1">
          <svg
            viewBox="0 0 460 290"
            className="block h-[clamp(240px,30vw,440px)] w-full rounded-[20px] bg-[#D9ECEE]"
            role="img"
            aria-label="Map of Europe. Spain and France are visited, Italy is planned."
          >
            <defs>
              <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="7" height="7" fill="#FDE8D3" />
                <rect width="3" height="7" fill="#F28C38" />
              </pattern>
            </defs>
            <g fill="#fff" fillOpacity=".75" stroke="#C3D6D9" strokeWidth="1.5" strokeLinejoin="round">
              <polygon points="125,60 150,55 155,85 140,105 120,95" />
              <polygon points="200,92 235,90 250,40 290,20 330,35 300,80 255,120 235,90" />
              <polygon points="185,115 200,140 205,175 225,170 250,160 255,120 235,90 200,92" />
              <polygon points="250,160 255,120 300,100 360,110 380,160 340,200 290,210 260,205 245,185" />
            </g>
            <g fill="#0F5E66" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round">
              <polygon points="40,190 70,170 130,172 150,190 140,225 100,245 55,235 35,215" />
              <polygon points="130,172 150,190 175,185 205,175 200,140 185,115 150,105 125,125 135,150" />
            </g>
            <polygon
              points="205,175 225,170 245,185 260,205 280,225 270,235 250,220 235,205 225,230 215,245 205,235 215,205 200,190"
              fill="url(#hatch)"
              stroke="#F28C38"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <g fontSize="12" fontWeight="500" fill="#2B2D33" stroke="#fff" strokeWidth="3" paintOrder="stroke">
              <circle cx="165" cy="128" r="4" fill="#fff" stroke="#2B2D33" strokeWidth="1.5" />
              <text x="173" y="124">Paris</text>
              <circle cx="138" cy="196" r="4" fill="#fff" stroke="#2B2D33" strokeWidth="1.5" />
              <text x="60" y="212">Barcelona</text>
              <circle cx="232" cy="205" r="4" fill="#fff" stroke="#2B2D33" strokeWidth="1.5" />
              <text x="242" y="232">Rome</text>
            </g>
          </svg>

          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
            <button type="button" aria-label="Zoom in" className="grid size-11 place-items-center rounded-xl bg-white shadow-sm">
              <Plus className="size-5" aria-hidden />
            </button>
            <button type="button" aria-label="Zoom out" className="grid size-11 place-items-center rounded-xl bg-white shadow-sm">
              <Minus className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-5 text-[13px] text-[#5F6370]">
        <span className="flex items-center gap-2">
          <i className="size-4 rounded-[5px] bg-[repeating-linear-gradient(45deg,#F28C38_0_3px,#FDE8D3_3px_6px)]" />
          Planned
        </span>
        <span className="flex items-center gap-2">
          <i className="size-4 rounded-[5px] bg-[#0F5E66]" />
          Visited
        </span>
        <span className="flex items-center gap-2">
          <i className="size-4 rounded-[5px] border border-[#C3D6D9] bg-white" />
          Not visited
        </span>
      </div>
    </section>
  );
}