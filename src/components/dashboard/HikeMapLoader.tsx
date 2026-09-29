"use client";

import dynamic from "next/dynamic";

const HikeMap = dynamic(() => import("./HikeMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-trail-950 text-sm text-white/50">
      Chargement de la carte...
    </div>
  ),
});

export default function HikeMapLoader({
  coordinates,
  blurred,
}: {
  coordinates: [number, number][];
  blurred?: boolean;
}) {
  return <HikeMap coordinates={coordinates} blurred={blurred} />;
}
