"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MAP_TILES } from "@/lib/mapTiles";

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
  const tiles = MAP_TILES[scheme];
  const positions: LatLngExpression[] = points.map((p) => [p.lat, p.lon]);
  const start = positions.length > 0 ? positions[0] : null;
  const current = positions.length > 0 ? positions[positions.length - 1] : null;

  return (
    <MapContainer
      center={current ?? [46.5, 2.5]}
      zoom={current ? 15 : 5}
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        key={scheme}
        attribution={tiles.attribution}
        url={tiles.url}
        maxZoom={tiles.maxZoom}
        tileSize={tiles.tileSize}
        zoomOffset={tiles.zoomOffset}
      />
      {positions.length > 1 && (
        <>
          {/* White casing under the orange line keeps the track readable on any terrain. */}
          <Polyline positions={positions} pathOptions={{ color: "#ffffff", weight: 11, opacity: 0.95 }} />
          <Polyline positions={positions} pathOptions={{ color: "#fd7310", weight: 6, opacity: 1 }} />
        </>
      )}
      {start && positions.length > 1 && (
        <CircleMarker
          center={start}
          radius={6}
          pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#3a7529", fillOpacity: 1 }}
        />
      )}
      {current && (
        <>
          {/* Soft halo + solid dot: the usual "you are here" marker. */}
          <CircleMarker
            center={current}
            radius={16}
            pathOptions={{ stroke: false, fillColor: "#fd7310", fillOpacity: 0.2 }}
          />
          <CircleMarker
            center={current}
            radius={8}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#fd7310", fillOpacity: 1 }}
          />
        </>
      )}
      <RecenterOnUpdate position={current} />
    </MapContainer>
  );
}
