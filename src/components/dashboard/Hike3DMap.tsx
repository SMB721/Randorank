"use client";

import { useEffect, useRef, useState } from "react";
import { blurEndpoints } from "@/lib/geoPrivacy";
import { useT } from "@/lib/i18n/app/client";
import { loadMapLibre, terrainStyle, type MapLibre } from "@/lib/maplibre";

export default function Hike3DMap({
  coordinates,
  blurred = false,
  basemap = "satellite",
}: {
  // GeoJSON order: [lon, lat].
  coordinates: [number, number][];
  blurred?: boolean;
  basemap?: "satellite" | "plan";
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
          style: terrainStyle(basemap),
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
  }, [coordinates, blurred, basemap]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-trail-950 px-6 text-center text-sm text-white/60">
        {t("map3d.error")}
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full bg-trail-950" />;
}
