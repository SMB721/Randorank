"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngBoundsLiteral, LatLngExpression } from "leaflet";
import { useColorScheme } from "@/hooks/useColorScheme";

const TILE_URLS = {
  light:
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};

export default function HikeMap({
  coordinates,
}: {
  // GeoJSON order: [lon, lat] — Leaflet wants [lat, lon].
  coordinates: [number, number][];
}) {
  const scheme = useColorScheme();
  const positions: LatLngExpression[] = coordinates.map(([lon, lat]) => [lat, lon]);
  const start = positions[0];
  const end = positions[positions.length - 1];

  const lats = coordinates.map(([, lat]) => lat);
  const lons = coordinates.map(([lon]) => lon);
  const bounds: LatLngBoundsLiteral = [
    [Math.min(...lats), Math.min(...lons)],
    [Math.max(...lats), Math.max(...lons)],
  ];

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [24, 24] }}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        key={scheme}
        attribution="Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS User Community"
        url={TILE_URLS[scheme]}
        maxZoom={16}
      />
      <Polyline positions={positions} pathOptions={{ color: "#fd7310", weight: 5, opacity: 0.95 }} />
      <CircleMarker
        center={start}
        radius={6}
        pathOptions={{ color: "#0f1a0c", weight: 2, fillColor: "#4c9436", fillOpacity: 1 }}
      />
      <CircleMarker
        center={end}
        radius={6}
        pathOptions={{ color: "#0f1a0c", weight: 2, fillColor: "#fd7310", fillOpacity: 1 }}
      />
    </MapContainer>
  );
}
