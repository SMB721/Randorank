"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngBoundsLiteral, LatLngExpression } from "leaflet";
import { useColorScheme } from "@/hooks/useColorScheme";
import { blurEndpoints } from "@/lib/geoPrivacy";
import { MAP_TILES, SATELLITE_LABELS_URL, SATELLITE_TILES, type Basemap } from "@/lib/mapTiles";

export default function HikeMap({
  coordinates,
  blurred = false,
  others = [],
  basemap = "satellite",
}: {
  // GeoJSON order: [lon, lat] — Leaflet wants [lat, lon].
  coordinates: [number, number][];
  // When true, trims the start/end of the track so the exact departure and
  // arrival points (often home) are never rendered — see src/lib/geoPrivacy.
  blurred?: boolean;
  // Other proposals (route comparison): drawn faded under the main track and
  // included in the bounds, so switching the highlighted one never re-zooms.
  others?: [number, number][][];
  basemap?: Basemap;
}) {
  const scheme = useColorScheme();
  const tiles = basemap === "satellite" ? SATELLITE_TILES : MAP_TILES[scheme];
  const displayCoordinates = blurred ? blurEndpoints(coordinates) : coordinates;
  const positions: LatLngExpression[] = displayCoordinates.map(([lon, lat]) => [lat, lon]);
  const start = positions[0];
  const end = positions[positions.length - 1];

  // Bounds are derived from the same (possibly trimmed) points as the
  // polyline — otherwise the map would still zoom/pan to reveal roughly
  // where the hidden endpoint sits, defeating the point of blurring it.
  const allPoints = [...displayCoordinates, ...others.flat()];
  const lats = allPoints.map(([, lat]) => lat);
  const lons = allPoints.map(([lon]) => lon);
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
        key={`${basemap}-${scheme}`}
        attribution={tiles.attribution}
        url={tiles.url}
        maxZoom={tiles.maxZoom}
        tileSize={tiles.tileSize}
        zoomOffset={tiles.zoomOffset}
      />
      {basemap === "satellite" && <TileLayer key="labels" url={SATELLITE_LABELS_URL} maxZoom={18} />}
      {others.map((other, i) => (
        <Polyline
          key={i}
          positions={other.map(([lon, lat]) => [lat, lon] as LatLngExpression)}
          pathOptions={{ color: "#8a9a85", weight: 4, opacity: 0.7, dashArray: "6 8" }}
        />
      ))}
      <Polyline positions={positions} pathOptions={{ color: "#ffffff", weight: 9, opacity: 0.9 }} />
      <Polyline positions={positions} pathOptions={{ color: "#fd7310", weight: 5, opacity: 1 }} />
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
