// Settings shared by every MapLibre map in the app. Import this only from client components.

// Free vector tiles from OpenFreeMap (OpenStreetMap data, no API key).
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// MapLibre 6 must be told where its worker file is when it runs inside Next.js.
// This loads the library in the browser only, and sets the worker before the first map is created.
export const mapLib =
  typeof window === "undefined"
    ? undefined
    : import("maplibre-gl").then((m) => {
        m.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
        return m;
      });