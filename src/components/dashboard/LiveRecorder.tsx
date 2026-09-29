"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { computeStats, haversineKm, type TrackPoint } from "@/lib/gpx";
import { useWakeLock } from "@/hooks/useWakeLock";
import { formatDuration } from "@/lib/format";
import { saveLiveHikeAction } from "@/app/dashboard/(premium)/randos/live/actions";

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-trail-950 text-sm text-white/50">
      Chargement de la carte...
    </div>
  ),
});

// Fixes worse than this (meters, 1-sigma) are dropped rather than plotted —
// better to lose a point than to draw a phantom jump on the map.
const MIN_ACCURACY_M = 50;
// A single GPS fix landing more than this far from the previous one is a bad
// reading, not real movement — skip it instead of polluting the track.
const MAX_JUMP_KM = 2;

type Status = "idle" | "requesting" | "recording" | "finishing" | "error";

export default function LiveRecorder() {
  const router = useRouter();
  const wakeLock = useWakeLock();

  const [status, setStatus] = useState<Status>("idle");
  const [points, setPoints] = useState<TrackPoint[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [gpsWarning, setGpsWarning] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const tickIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastPointRef = useRef<TrackPoint | null>(null);
  const statusRef = useRef<Status>("idle");
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  function stopWatching() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (tickIdRef.current !== null) {
      window.clearInterval(tickIdRef.current);
      tickIdRef.current = null;
    }
  }

  // The browser silently drops the wake lock whenever the tab is hidden —
  // re-request it the moment the user comes back, for as long as we're
  // still recording.
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && statusRef.current === "recording") {
        wakeLock.request();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      stopWatching();
      wakeLock.release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStart() {
    setError(null);
    setGpsWarning(null);

    if (!("geolocation" in navigator)) {
      setError("Votre navigateur ne supporte pas la géolocalisation.");
      setStatus("error");
      return;
    }

    setStatus("requesting");
    await wakeLock.request();

    startTimeRef.current = Date.now();
    lastPointRef.current = null;
    setPoints([]);
    setDistanceKm(0);
    setElapsedSeconds(0);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude, accuracy } = position.coords;

        if (accuracy !== null && accuracy > MIN_ACCURACY_M) {
          setGpsWarning("Signal GPS faible — certains points sont ignorés.");
          return;
        }

        const point: TrackPoint = {
          lat: latitude,
          lon: longitude,
          ele: altitude ?? null,
          time: new Date(position.timestamp).toISOString(),
        };

        if (lastPointRef.current) {
          const segmentKm = haversineKm(lastPointRef.current, point);
          if (segmentKm > MAX_JUMP_KM) {
            // Bad fix (signal bounced off a ridge, GPS glitch) — skip it,
            // keep the last good point as the reference for the next one.
            return;
          }
          setGpsWarning(null);
          setDistanceKm((d) => Number((d + segmentKm).toFixed(2)));
        }

        lastPointRef.current = point;
        setPoints((prev) => [...prev, point]);
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(
            "Accès à la position refusé. Autorisez la géolocalisation dans les réglages de votre navigateur pour enregistrer votre rando."
          );
          setStatus("error");
          stopWatching();
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    tickIdRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    setStatus("recording");
  }

  async function handleStop() {
    setStatus("finishing");
    stopWatching();
    await wakeLock.release();

    if (points.length < 2) {
      setError(
        "Pas assez de points GPS enregistrés pour créer une rando — réessayez avec un meilleur signal."
      );
      setStatus("error");
      return;
    }

    const stats = computeStats(points);
    const coordinates: [number, number][] = points.map((p) => [p.lon, p.lat]);
    const name = `Randonnée du ${new Date().toLocaleDateString("fr-FR")}`;

    const result = await saveLiveHikeAction({
      name,
      coordinates,
      distanceKm: stats.distanceKm,
      elevationGainM: stats.elevationGainM,
      durationSeconds: stats.durationSeconds,
      avgSpeedKmh: stats.avgSpeedKmh,
      startedAt: stats.startedAt,
      isValid: stats.isValid,
      validationNotes: stats.validationNotes,
    });

    if (!result.success) {
      setError(result.error);
      setStatus("error");
      return;
    }

    router.push(`/dashboard/randos/${result.id}`);
  }

  function handleRetry() {
    setError(null);
    setStatus("idle");
  }

  const isRecording = status === "recording" || status === "finishing";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Gardez cet onglet ouvert et votre téléphone déverrouillé pendant toute la
        rando : si vous changez d&apos;application ou verrouillez manuellement
        l&apos;écran, l&apos;enregistrement s&apos;interrompt.
      </div>

      {status === "idle" && (
        <button
          type="button"
          onClick={handleStart}
          className="w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
        >
          Démarrer ma rando
        </button>
      )}

      {status === "requesting" && (
        <p className="rounded-xl border border-trail-200 bg-white p-4 text-center text-sm text-trail-600">
          Activation du GPS...
        </p>
      )}

      {isRecording && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-trail-200 bg-white p-4 text-center">
              <p className="font-display text-2xl tracking-wide text-trail-900">
                {formatDuration(elapsedSeconds)}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-trail-500">Durée</p>
            </div>
            <div className="rounded-xl border border-trail-200 bg-white p-4 text-center">
              <p className="font-display text-2xl tracking-wide text-trail-900">
                {distanceKm.toFixed(2)} km
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-trail-500">Distance</p>
            </div>
            <div className="rounded-xl border border-trail-200 bg-white p-4 text-center">
              <p className="font-display text-2xl tracking-wide text-trail-900">
                {points.length}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-trail-500">
                Points GPS
              </p>
            </div>
          </div>

          {gpsWarning && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {gpsWarning}
            </p>
          )}
          {!wakeLock.supported && (
            <p className="text-xs text-trail-500">
              Votre navigateur ne supporte pas le maintien automatique de l&apos;écran
              allumé — pensez à désactiver la mise en veille manuellement.
            </p>
          )}

          <div className="h-72 overflow-hidden rounded-2xl border border-trail-200">
            <LiveMap points={points} />
          </div>

          <button
            type="button"
            onClick={handleStop}
            disabled={status === "finishing"}
            className="w-full rounded-xl bg-trail-900 py-3 text-sm font-semibold text-white transition hover:bg-trail-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "finishing" ? "Enregistrement..." : "Terminer ma rando"}
          </button>
        </>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="w-full rounded-xl border-2 border-trail-900 py-3 text-sm font-semibold text-trail-900 transition hover:bg-trail-900 hover:text-white"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}
