"use client";

import { useId } from "react";
import { buildProfile } from "@/lib/elevationProfile";
import { useT } from "@/lib/i18n/app/client";

const WIDTH = 600;
const HEIGHT = 160;
const PAD = { top: 12, right: 8, bottom: 22, left: 8 };

// Altitude over distance as a filled area. Pure SVG: no chart library for a
// single shape.
export default function ElevationProfile({
  coordinates,
  elevations,
}: {
  coordinates: [number, number][];
  elevations: number[];
}) {
  const { t } = useT();
  const gradientId = useId();
  const points = buildProfile(coordinates, elevations);
  if (points.length < 2) return null;

  const alts = points.map((p) => p.alt);
  const minAlt = Math.min(...alts);
  const maxAlt = Math.max(...alts);
  const totalKm = points[points.length - 1].km;
  const range = Math.max(1, maxAlt - minAlt);

  const x = (km: number) => PAD.left + (km / totalKm) * (WIDTH - PAD.left - PAD.right);
  const y = (alt: number) =>
    PAD.top + (1 - (alt - minAlt) / range) * (HEIGHT - PAD.top - PAD.bottom);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.km).toFixed(1)},${y(p.alt).toFixed(1)}`).join(" ");
  const area = `${line} L${x(totalKm).toFixed(1)},${HEIGHT - PAD.bottom} L${x(0).toFixed(1)},${HEIGHT - PAD.bottom} Z`;

  return (
    <figure>
      <figcaption className="mb-1 flex items-baseline justify-between text-xs font-semibold uppercase tracking-widest text-trail-500">
        <span>{t("gen.profile.title")}</span>
        <span className="normal-case tracking-normal text-trail-400">
          {t("gen.profile.range", { min: Math.round(minAlt), max: Math.round(maxAlt) })}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t("gen.profile.title")}
        className="h-auto w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fd7310" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fd7310" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="#fd7310" strokeWidth="2.5" strokeLinejoin="round" />
        <text x={PAD.left} y={HEIGHT - 6} fontSize="11" fill="#8a9a85">
          0 km
        </text>
        <text x={WIDTH - PAD.right} y={HEIGHT - 6} fontSize="11" fill="#8a9a85" textAnchor="end">
          {totalKm.toFixed(1)} km
        </text>
      </svg>
    </figure>
  );
}
