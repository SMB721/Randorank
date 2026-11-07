"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/app/client";
import { loadMapLibre, terrainStyle, type MapLibre } from "@/lib/maplibre";

type Point = { lat: number; lon: number };

function trackData(points: Point[]) {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: points.map((p) => [p.lon, p.lat]) },
  };
}

function positionData(points: Point[]) {
  const last = points[points.length - 1];
  return {
    type: "FeatureCollection",
    features: last
      ? [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [last.lon, last.lat] } }]
      : [],
  };
}

// Live 3D view: the camera follows the walker in a tilted perspective over
// the relief, and the track grows as new GPS points arrive.
export default function LiveMap3D({ points }: { points: Point[] }) {
  const { t } = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibre | null>(null);
  const readyRef = useRef(false);
  const pointsRef = useRef(points);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    let cancelled = false;
    loadMapLibre()
      .then((maplibregl) => {
        if (cancelled || !containerRef.current) return;
        const initial = pointsRef.current;
        const last = initial[initial.length - 1];
        const map = new maplibregl.Map({
          container: containerRef.current,
          style: terrainStyle(),
          center: last ? [last.lon, last.lat] : [2.5, 46.5],
          zoom: last ? 15 : 5,
          pitch: 60,
          bearing: -20,
          maxPitch: 75,
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

        map.on("load", () => {
          map.addSource("track", { type: "geojson", data: trackData(pointsRef.current) });
          map.addLayer({
            id: "track-casing",
            type: "line",
            source: "track",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#ffffff", "line-width": 10 },
          });
          map.addLayer({
            id: "track",
            type: "line",
            source: "track",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#fd7310", "line-width": 6 },
          });
          map.addSource("position", { type: "geojson", data: positionData(pointsRef.current) });
          map.addLayer({
            id: "position-halo",
            type: "circle",
            source: "position",
            paint: { "circle-radius": 18, "circle-color": "#fd7310", "circle-opacity": 0.2 },
          });
          map.addLayer({
            id: "position",
            type: "circle",
            source: "position",
            paint: {
              "circle-radius": 8,
              "circle-color": "#fd7310",
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 3,
            },
          });
          readyRef.current = true;
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      readyRef.current = false;
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  // New GPS point: extend the track and glide the camera to it, keeping the
  // walker's own tilt and rotation.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || points.length === 0) return;
    map.getSource("track")?.setData(trackData(points));
    map.getSource("position")?.setData(positionData(points));
    const last = points[points.length - 1];
    map.easeTo({ center: [last.lon, last.lat], zoom: Math.max(map.getZoom(), 14), duration: 800 });
  }, [points]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-trail-950 px-6 text-center text-sm text-white/60">
        {t("map3d.error")}
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full bg-trail-950" />;
}
