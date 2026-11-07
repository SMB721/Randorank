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

export function terrainStyle(): MapLibre {
  return {
    version: 8,
    sources: {
      topo: {
        type: "raster",
        tiles: [ESRI_TOPO],
        tileSize: 256,
        maxzoom: 17,
        attribution: "Esri, HERE, Garmin, Intermap, USGS, METI/NASA, NGA, © OpenStreetMap contributors",
      },
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
      { id: "topo", type: "raster", source: "topo" },
      {
        id: "hillshade",
        type: "hillshade",
        source: "shade",
        paint: { "hillshade-exaggeration": 0.3, "hillshade-shadow-color": "#2f3b2a" },
      },
    ],
    terrain: { source: "terrain", exaggeration: 1.5 },
  };
}
