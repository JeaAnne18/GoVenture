import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// FOSSGIS runs free OSRM routing servers with separate paths per way of travelling.
const PROFILES = { car: "routed-car", foot: "routed-foot", bike: "routed-bike" } as const;

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ route: null }, { status: 401 });

  const sp = new URL(request.url).searchParams;
  const mode = sp.get("mode") ?? "";
  if (!Object.hasOwn(PROFILES, mode)) return NextResponse.json({ route: null }, { status: 400 });

  const [fromLat, fromLon, toLat, toLon] = ["fromLat", "fromLon", "toLat", "toLon"].map((k) => Number(sp.get(k)));
  if (![fromLat, fromLon, toLat, toLon].every(Number.isFinite)) {
    return NextResponse.json({ route: null }, { status: 400 });
  }

  const profile = PROFILES[mode as keyof typeof PROFILES];
  const url = `https://routing.openstreetmap.de/${profile}/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GoVenture (portfolio project)" },
      next: { revalidate: 3600 }, // the same trip asked again within an hour is served from cache
    });
    if (!res.ok) throw new Error(`Routing server returned ${res.status}`);
    const data = (await res.json()) as {
      code: string;
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    const r = data.code === "Ok" ? data.routes?.[0] : undefined;
    if (!r) return NextResponse.json({ route: null });
    return NextResponse.json({ route: { distance: r.distance, duration: r.duration, coordinates: r.geometry.coordinates } });
  } catch {
    return NextResponse.json({ route: null }, { status: 502 });
  }
}