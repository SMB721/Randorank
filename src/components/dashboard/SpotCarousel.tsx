"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Spot } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n/app/client";

const SLIDE_DURATION_MS = 10000;

export default function SpotCarousel({ spots }: { spots: Spot[] }) {
  const { t } = useT();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (spots.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % spots.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [spots.length]);

  if (spots.length === 0) return null;

  const spot = spots[index];

  return (
    <div
      className="mt-6 animate-fade-in-up overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-white shadow-xl backdrop-blur-md"
      style={{ animationDelay: "400ms" }}
    >
      <div key={spot.id} className="animate-fade-in">
        <div className="relative h-40 w-full">
          <Image
            src={spot.image_url}
            alt={spot.name}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-trail-950/85 via-trail-950/10 to-transparent" />
          <span className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
            {spot.region}
          </span>
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-summit-400">
            {t("spots.eyebrow")}
          </p>
          <p className="mt-1 font-display text-2xl tracking-wide">{spot.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{spot.short_story}</p>
        </div>
      </div>

      {spots.length > 1 && (
        <div className="flex gap-1.5 px-6 pb-6">
          {spots.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("spots.view", { name: s.name })}
              className={`h-1.5 flex-1 rounded-full transition ${
                i === index ? "bg-summit-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
