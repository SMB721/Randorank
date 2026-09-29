"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngBoundsLiteral, LatLngExpression } from "leaflet";
import { useColorScheme } from "@/hooks/useColorScheme";
import { blurEndpoints } from "@/lib/geoPrivacy";

const TILE_URLS = {
  light:
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};

export default function HikeMap({
  coordinates,
  blurred = false,
}: {
  // GeoJSON order: [lon, lat] — Leaflet wants [lat, lon].
  coordinates: [number, number][];
  // When true, trims the start/end of the track so the exact departure and
  // arrival points (often home) are never rendered — see src/lib/geoPrivacy.
  blurred?: boolean;
}) {
  const scheme = useColorScheme();
  const displayCoordinates = blurred ? blurEndpoints(coordinates) : coordinates;
  const positions: LatLngExpression[] = displayCoordinates.map(([lon, lat]) => [lat, lon]);
  const start = positions[0];
  const end = positions[positions.length - 1];

  // Bounds are derived from the same (possibly trimmed) points as the
  // polyline — otherwise the map would still zoom/pan to reveal roughly
  // where the hidden endpoint sits, defeating the point of blurring it.
  const lats = displayCoordinates.map(([, lat]) => lat);
  const lons = displayCoordinates.map(([lon]) => lon);
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
