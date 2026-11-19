import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { photonToPlace } from "@/lib/places";

// Our own search endpoint. The browser calls this, and this calls Photon.
// That keeps the geocoder behind your login and lets you swap providers later.
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ results: [] }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ results: [] });

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "6");
  url.searchParams.set("lang", "en");

  // Optional: prefer results near the part of the map she is looking at.
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  if (searchParams.get("lat") && searchParams.get("lon") && Number.isFinite(lat) && Number.isFinite(lon)) {
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GoVenture (portfolio project)" },
      next: { revalidate: 86_400 }, // identical searches are cached for a day, which keeps us polite to Photon
    });
    if (!res.ok) throw new Error(`Photon returned ${res.status}`);
    const data = (await res.json()) as { features?: Parameters<typeof photonToPlace>[0][] };
    const results = (data.features ?? []).map(photonToPlace).filter((p) => p !== null);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}