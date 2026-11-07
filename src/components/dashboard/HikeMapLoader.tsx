"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useT } from "@/lib/i18n/app/client";

function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-trail-950 text-sm text-white/50">
      …
    </div>
  );
}

const HikeMap = dynamic(() => import("./HikeMap"), { ssr: false, loading: Loading });
const Hike3DMap = dynamic(() => import("./Hike3DMap"), { ssr: false, loading: Loading });

export default function HikeMapLoader({
  coordinates,
  blurred,
  others,
}: {
  coordinates: [number, number][];
  blurred?: boolean;
  others?: [number, number][][];
}) {
  const { t } = useT();
  const [is3D, setIs3D] = useState(false);
  // The 3D view shows a single track; route comparison stays in 2D.
  const can3D = !others || others.length === 0;

  return (
    <div className="relative h-full w-full">
      {is3D && can3D ? (
        <Hike3DMap coordinates={coordinates} blurred={blurred} />
      ) : (
        <HikeMap coordinates={coordinates} blurred={blurred} others={others} />
      )}
      {can3D && (
        <button
          type="button"
          onClick={() => setIs3D((v) => !v)}
          aria-pressed={is3D}
          aria-label={is3D ? t("map3d.show2d") : t("map3d.show3d")}
          className={`absolute bottom-3 left-3 z-[500] flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold shadow-lg transition ${
            is3D ? "bg-summit-500 text-white" : "bg-white text-trail-950 hover:bg-trail-50"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3 3 7.5l9 4.5 9-4.5z" />
            <path d="M3 7.5v9L12 21l9-4.5v-9M12 12v9" />
          </svg>
          {is3D ? "2D" : "3D"}
        </button>
      )}
    </div>
  );
}
