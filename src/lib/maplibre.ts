// Shared MapLibre GL setup for the 3D maps.
//
// MapLibre GL (open source, free) is loaded on demand from a pinned CDN build:
// only people who open a 3D view download it, and the 2D maps stay on Leaflet.
const MAPLIBRE_VERSION = "4.7.1";
const MAPLIBRE_JS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
const MAPLIBRE_CSS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;

// Same Esri topographic basemap as the 2D maps, draped over free elevation
// data (Terrarium tiles from Mapzen, hosted on AWS Open Data).
const ESRI_TOPO =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
const ESRI_IMAGERY =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_LABELS =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type MapLibre = any;

let loader: Promise<MapLibre> | null = null;

export function loadMapLibre(): Promise<MapLibre> {
  const w = window as unknown as { maplibregl?: MapLibre };
  if (w.maplibregl) return Promise.resolve(w.maplibregl);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPLIBRE_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = MAPLIBRE_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = MAPLIBRE_JS;
    script.async = true;
    script.onload = () => resolve(w.maplibregl);
    script.onerror = () => {
      loader = null;
      reject(new Error("maplibre failed to load"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

export function terrainStyle(basemap: "satellite" | "plan" = "satellite"): MapLibre {
  const satellite = basemap === "satellite";
  return {
    version: 8,
    sources: {
      base: {
        type: "raster",
        tiles: [satellite ? ESRI_IMAGERY : ESRI_TOPO],
        tileSize: 256,
        maxzoom: satellite ? 18 : 17,
        attribution: satellite
          ? "Esri, Maxar, Earthstar Geographics, and the GIS User Community"
          : "Esri, HERE, Garmin, Intermap, USGS, METI/NASA, NGA, © OpenStreetMap contributors",
      },
      labels: { type: "raster", tiles: [ESRI_LABELS], tileSize: 256, maxzoom: 18 },
      terrain: {
        type: "raster-dem",
        tiles: [TERRARIUM],
        encoding: "terrarium",
        tileSize: 256,
        maxzoom: 15,
        attribution: "Terrain: Mapzen, AWS Open Data",
      },
      shade: { type: "raster-dem", tiles: [TERRARIUM], encoding: "terrarium", tileSize: 256, maxzoom: 15 },
    },
    layers: [
      { id: "base", type: "raster", source: "base" },
      {
        id: "hillshade",
        type: "hillshade",
        source: "shade",
        paint: {
          "hillshade-exaggeration": satellite ? 0.15 : 0.3,
          "hillshade-shadow-color": "#2f3b2a",
        },
      },
      ...(satellite ? [{ id: "labels", type: "raster", source: "labels" }] : []),
    ],
    terrain: { source: "terrain", exaggeration: 1.5 },
  };
}
