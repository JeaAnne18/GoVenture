import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { photonToPlace } from "@/lib/places";

// Turns coordinates into a readable address, like "Rizal Avenue, Cabanatuan, Philippines".
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ address: null }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return NextResponse.json({ address: null }, { status: 400 });

  const url = new URL("https://photon.komoot.io/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url, { headers: { "User-Agent": "GoVenture (portfolio project)" } });
    if (!res.ok) throw new Error(`Photon returned ${res.status}`);
    const data = (await res.json()) as { features?: Parameters<typeof photonToPlace>[0][] };
    const feature = data.features?.[0];
    return NextResponse.json({ address: feature ? (photonToPlace(feature)?.address ?? null) : null });
  } catch {
    return NextResponse.json({ address: null });
  }
}