"use client";

import { useEffect, useRef, useState } from "react";
import { blurEndpoints } from "@/lib/geoPrivacy";
import { useT } from "@/lib/i18n/app/client";

// MapLibre GL (open source, free) is loaded on demand from a pinned CDN build:
// only people who open the 3D view download it, and the 2D maps stay on Leaflet.
const MAPLIBRE_VERSION = "4.7.1";
const MAPLIBRE_JS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
const MAPLIBRE_CSS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;

// Same Esri topographic basemap as the 2D maps, draped over free elevation
// data (Terrarium tiles from Mapzen, hosted on AWS Open Data).
const ESRI_TOPO =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";
const TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

/* eslint-disable @typescript-eslint/no-explicit-any */
type MapLibre = any;

let loader: Promise<MapLibre> | null = null;

function loadMapLibre(): Promise<MapLibre> {
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

export default function Hike3DMap({
  coordinates,
  blurred = false,
}: {
  // GeoJSON order: [lon, lat].
  coordinates: [number, number][];
  blurred?: boolean;
}) {
  const { t } = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let map: MapLibre | null = null;
    let cancelled = false;
    // Same privacy trimming as the 2D map: never show the exact endpoints.
    const track = blurred ? blurEndpoints(coordinates) : coordinates;
    if (track.length < 2) return;

    loadMapLibre()
      .then((maplibregl) => {
        if (cancelled || !containerRef.current) return;
        const lons = track.map(([lon]) => lon);
        const lats = track.map(([, lat]) => lat);
        const bounds: [[number, number], [number, number]] = [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ];

        map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              topo: {
                type: "raster",
                tiles: [ESRI_TOPO],
                tileSize: 256,
                maxzoom: 17,
                attribution:
                  "Esri, HERE, Garmin, Intermap, USGS, METI/NASA, NGA, © OpenStreetMap contributors",
              },
              terrain: {
                type: "raster-dem",
                tiles: [TERRARIUM],
                encoding: "terrarium",
                tileSize: 256,
                maxzoom: 15,
                attribution: "Terrain: Mapzen, AWS Open Data",
              },
              shade: {
                type: "raster-dem",
                tiles: [TERRARIUM],
                encoding: "terrarium",
                tileSize: 256,
                maxzoom: 15,
              },
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
          },
          bounds,
          fitBoundsOptions: { padding: 48 },
          maxPitch: 75,
          attributionControl: { compact: true },
        });
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

        map.on("load", () => {
          map.addSource("track", {
            type: "geojson",
            data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: track } },
          });
          map.addLayer({
            id: "track-casing",
            type: "line",
            source: "track",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#ffffff", "line-width": 9 },
          });
          map.addLayer({
            id: "track",
            type: "line",
            source: "track",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#fd7310", "line-width": 5 },
          });
          map.addSource("endpoints", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                { type: "Feature", properties: { color: "#3a7529" }, geometry: { type: "Point", coordinates: track[0] } },
                {
                  type: "Feature",
                  properties: { color: "#fd7310" },
                  geometry: { type: "Point", coordinates: track[track.length - 1] },
                },
              ],
            },
          });
          map.addLayer({
            id: "endpoints",
            type: "circle",
            source: "endpoints",
            paint: {
              "circle-radius": 7,
              "circle-color": ["get", "color"],
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 3,
            },
          });
          // Tilt and turn slowly into the 3D view.
          map.easeTo({ pitch: 62, bearing: -25, duration: 1800 });
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [coordinates, blurred]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-trail-950 px-6 text-center text-sm text-white/60">
        {t("map3d.error")}
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full bg-trail-950" />;
}
