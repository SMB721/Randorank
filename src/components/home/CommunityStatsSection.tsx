"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import type { CommunityStats, CommunityWeeklyKm } from "@/lib/supabase/types";

const WEEKS_TO_SHOW = 8;

// Aligns raw weekly rows to a fixed 8-week window (Monday-start), filling
// any week with no activity with 0 — keeps the chart shape stable even
// when the dataset is sparse (new communities, quiet weeks).
function buildWeeklySeries(weekly: CommunityWeeklyKm[]): number[] {
  const now = new Date();
  const diffToMonday = (now.getDay() + 6) % 7;
  const thisMonday = new Date(now);
  thisMonday.setHours(0, 0, 0, 0);
  thisMonday.setDate(now.getDate() - diffToMonday);

  const byWeek = new Map(weekly.map((w) => [w.week_start, w.km]));

  const series: number[] = [];
  for (let i = WEEKS_TO_SHOW - 1; i >= 0; i--) {
    const d = new Date(thisMonday);
    d.setDate(thisMonday.getDate() - i * 7);
    series.push(byWeek.get(d.toISOString().slice(0, 10)) ?? 0);
  }
  return series;
}

export default function CommunityStatsSection({
  stats,
  weekly,
}: {
  stats: CommunityStats;
  weekly: CommunityWeeklyKm[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const series = buildWeeklySeries(weekly);
  const max = Math.max(...series, 1);
  const points = series.map((v, i) => {
    const x = (i / (series.length - 1)) * 100;
    const y = 100 - (v / max) * 88;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L 100,100 L 0,100 Z`;

  return (
    <div ref={ref}>
      <div className="grid gap-10 sm:grid-cols-2">
        <div>
          <p className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            <AnimatedNumber
              value={visible ? stats.total_km : 0}
              decimals={0}
              suffix=" km"
              duration={1400}
            />
          </p>
          <p className="mt-2 text-sm uppercase tracking-widest text-white/50">
            Parcourus par la communauté
          </p>
        </div>
        <div>
          <p className="font-display text-5xl tracking-wide text-white sm:text-6xl">
            <AnimatedNumber
              value={visible ? stats.total_elevation_m : 0}
              decimals={0}
              suffix=" m"
              duration={1400}
            />
          </p>
          <p className="mt-2 text-sm uppercase tracking-widest text-white/50">
            De dénivelé cumulé
          </p>
        </div>
      </div>

      <div className="mt-12 h-40 w-full">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="community-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fd7310" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fd7310" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={areaPath}
            fill="url(#community-fill)"
            className={`transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
          />
          <path
            d={linePath}
            fill="none"
            stroke="#ff9436"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: visible ? 0 : 1,
              transition: "stroke-dashoffset 1.4s ease-out 0.2s",
            }}
          />
        </svg>
      </div>
      <p className="mt-2 text-center text-xs uppercase tracking-widest text-white/40">
        Kilomètres cumulés par semaine, communauté entière
      </p>
    </div>
  );
}
