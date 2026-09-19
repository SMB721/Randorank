"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useColorScheme } from "@/hooks/useColorScheme";

const TILE_URLS = {
  light:
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};

function RecenterOnUpdate({ position }: { position: LatLngExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 15));
    }
  }, [position, map]);
  return null;
}

export default function LiveMap({ points }: { points: { lat: number; lon: number }[] }) {
  const scheme = useColorScheme();
  const positions: LatLngExpression[] = points.map((p) => [p.lat, p.lon]);
  const current = positions.length > 0 ? positions[positions.length - 1] : null;

  return (
    <MapContainer
      center={current ?? [46.5, 2.5]}
      zoom={current ? 15 : 5}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        key={scheme}
        attribution="Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS User Community"
        url={TILE_URLS[scheme]}
        maxZoom={16}
      />
      {positions.length > 1 && (
        <Polyline positions={positions} pathOptions={{ color: "#fd7310", weight: 5, opacity: 0.95 }} />
      )}
      {current && (
        <CircleMarker
          center={current}
          radius={7}
          pathOptions={{ color: "#0f1a0c", weight: 2, fillColor: "#4c9436", fillOpacity: 1 }}
        />
      )}
      <RecenterOnUpdate position={current} />
    </MapContainer>
  );
}
