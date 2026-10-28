"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { computeStats, haversineKm, trackDistanceKm, type TrackPoint } from "@/lib/gpx";
import { clearDraft, loadDraft, saveDraft, type LiveDraft } from "@/lib/liveDraft";
import { useWakeLock } from "@/hooks/useWakeLock";
import { formatDuration } from "@/lib/format";
import { sampleElevations } from "@/lib/elevationProfile";
import { useT } from "@/lib/i18n/app/client";
import { saveLiveHikeAction } from "@/app/(site)/dashboard/(app)/randos/live/actions";

function MapLoading() {
  const { t } = useT();
  return (
    <div className="flex h-full w-full items-center justify-center bg-trail-950 text-sm text-white/50">
      {t("live.mapLoading")}
    </div>
  );
}

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

// Fixes worse than this (meters, 1-sigma) are dropped rather than plotted —
// better to lose a point than to draw a phantom jump on the map.
const MIN_ACCURACY_M = 50;
// Within one uninterrupted stretch, a single GPS fix landing more than this
// far from the previous one is a bad reading, not real movement — skip it
// instead of polluting the track.
const MAX_JUMP_KM = 2;
// No position callback for this long means recording was interrupted (phone
// locked, tab frozen, no signal). The next point opens a new segment: the
// jump across the hole is neither counted as distance nor checked as speed.
const GAP_MS = 90_000;
// How often the running track is copied to the phone's storage.
const DRAFT_SAVE_EVERY_S = 10;

type Status = "idle" | "requesting" | "recording" | "finishing" | "error";

export default function LiveRecorder() {
  const router = useRouter();
  const { t, locale } = useT();
  const wakeLock = useWakeLock();

  const [status, setStatus] = useState<Status>("idle");
  const [points, setPoints] = useState<TrackPoint[]>([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [gpsWarning, setGpsWarning] = useState<string | null>(null);
  const [gapNotice, setGapNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<LiveDraft | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const tickIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const statusRef = useRef<Status>("idle");
  // Mirrors of the React state, readable from timers and event handlers.
  const pointsRef = useRef<TrackPoint[]>([]);
  const lastPointRef = useRef<TrackPoint | null>(null);
  const lastCallbackRef = useRef<number | null>(null);
  const pendingGapRef = useRef(false);
  const interruptedAtRef = useRef<number | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // A recording interrupted earlier (reload, crash, page killed) is offered
  // back instead of being lost.
  useEffect(() => {
    // localStorage only exists in the browser: reading it during render
    // would not match the server-rendered page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadDraft());
  }, []);

  function persistDraft() {
    if (pointsRef.current.length === 0 || startTimeRef.current === null) return;
    saveDraft({
      startedAtMs: startTimeRef.current,
      savedAtMs: Date.now(),
      points: pointsRef.current,
    });
  }

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

  // Hiding the page (lock screen, other app) suspends the browser: no GPS
  // points arrive until it comes back. Save what we have right away, and
  // remember that the next fix starts a new segment. The wake lock is also
  // dropped by the browser when the page is hidden, so ask for it again.
  useEffect(() => {
    function handleVisibility() {
      if (statusRef.current !== "recording") return;
      if (document.visibilityState === "hidden") {
        interruptedAtRef.current = Date.now();
        pendingGapRef.current = true;
        persistDraft();
      } else {
        wakeLock.request();
      }
    }
    function handlePageHide() {
      if (statusRef.current === "recording") persistDraft();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      stopWatching();
      wakeLock.release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFix(position: GeolocationPosition) {
    const nowMs = Date.now();
    const sinceLast = lastCallbackRef.current === null ? 0 : nowMs - lastCallbackRef.current;
    lastCallbackRef.current = nowMs;
    if (sinceLast > GAP_MS) {
      pendingGapRef.current = true;
      interruptedAtRef.current ??= nowMs - sinceLast;
    }

    const { latitude, longitude, altitude, accuracy } = position.coords;

    if (accuracy !== null && accuracy > MIN_ACCURACY_M) {
      setGpsWarning(t("live.weakSignal"));
      return;
    }

    const startsSegment = pendingGapRef.current && lastPointRef.current !== null;
    const point: TrackPoint = {
      lat: latitude,
      lon: longitude,
      ele: altitude ?? null,
      time: new Date(position.timestamp).toISOString(),
      ...(startsSegment ? { segmentStart: true } : {}),
    };

    if (startsSegment) {
      const minutes = Math.max(
        1,
        Math.round((nowMs - (interruptedAtRef.current ?? nowMs)) / 60_000)
      );
      setGapNotice(t("live.gapNotice", { minutes }));
    } else if (lastPointRef.current) {
      const segmentKm = haversineKm(lastPointRef.current, point);
      if (segmentKm > MAX_JUMP_KM) {
        // Bad fix (signal bounced off a ridge, GPS glitch) — skip it,
        // keep the last good point as the reference for the next one.
        return;
      }
      setDistanceKm((d) => Number((d + segmentKm).toFixed(2)));
    }

    pendingGapRef.current = false;
    interruptedAtRef.current = null;
    setGpsWarning(null);
    lastPointRef.current = point;
    pointsRef.current = [...pointsRef.current, point];
    setPoints(pointsRef.current);
  }

  function beginWatching() {
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleFix,
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(t("live.denied"));
          setStatus("error");
          stopWatching();
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    let ticks = 0;
    tickIdRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
      ticks++;
      if (ticks % DRAFT_SAVE_EVERY_S === 0) persistDraft();
    }, 1000);

    setStatus("recording");
  }

  async function handleStart() {
    setError(null);
    setGpsWarning(null);
    setGapNotice(null);

    if (!("geolocation" in navigator)) {
      setError(t("live.noGeo"));
      setStatus("error");
      return;
    }

    clearDraft();
    setDraft(null);
    setStatus("requesting");
    await wakeLock.request();

    startTimeRef.current = Date.now();
    lastPointRef.current = null;
    lastCallbackRef.current = null;
    pendingGapRef.current = false;
    interruptedAtRef.current = null;
    pointsRef.current = [];
    setPoints([]);
    setDistanceKm(0);
    setElapsedSeconds(0);

    beginWatching();
  }

  // Pick an interrupted recording back up: the first new fix opens a new
  // segment, so the time spent away is a gap, not a teleport.
  async function handleResume() {
    if (!draft) return;
    setError(null);
    setGpsWarning(null);
    setGapNotice(null);

    if (!("geolocation" in navigator)) {
      setError(t("live.noGeo"));
      setStatus("error");
      return;
    }

    setStatus("requesting");
    await wakeLock.request();

    startTimeRef.current = draft.startedAtMs;
    pointsRef.current = draft.points;
    lastPointRef.current = draft.points[draft.points.length - 1];
    lastCallbackRef.current = null;
    pendingGapRef.current = true;
    interruptedAtRef.current = draft.savedAtMs;
    setPoints(draft.points);
    setDistanceKm(trackDistanceKm(draft.points));
    setElapsedSeconds(Math.floor((Date.now() - draft.startedAtMs) / 1000));
    setDraft(null);

    beginWatching();
  }

  async function finishWith(track: TrackPoint[]) {
    setStatus("finishing");
    stopWatching();
    await wakeLock.release();

    if (track.length < 2) {
      setError(t("live.tooFewPoints"));
      setStatus("error");
      return;
    }

    const stats = computeStats(track);
    const coordinates: [number, number][] = track.map((p) => [p.lon, p.lat]);
    const name = t("hike.defaultName", { date: new Date().toLocaleDateString(locale) });

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
      elevations: sampleElevations(track.map((p) => p.ele)),
    });

    if (!result.success) {
      persistDraft();
      setError(result.error);
      setStatus("error");
      return;
    }

    clearDraft();
    router.push(`/dashboard/randos/${result.id}`);
  }

  function handleStop() {
    return finishWith(pointsRef.current);
  }

  // Save an interrupted recording as it is, without recording any further.
  function handleFinishDraft() {
    if (!draft) return;
    startTimeRef.current = draft.startedAtMs;
    pointsRef.current = draft.points;
    setDraft(null);
    return finishWith(draft.points);
  }

  function handleDiscardDraft() {
    if (!window.confirm(t("live.draft.discardConfirm"))) return;
    clearDraft();
    setDraft(null);
  }

  function handleRetry() {
    setError(null);
    setDraft(loadDraft());
    setStatus("idle");
  }

  const isRecording = status === "recording" || status === "finishing";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t("live.keepOpen")}
      </div>

      {status === "idle" && draft && (
        <div className="space-y-3 rounded-xl border border-summit-200 bg-summit-50 p-4">
          <p className="font-display text-xl tracking-wide text-trail-900">
            {t("live.draft.title")}
          </p>
          <p className="text-sm text-trail-700">
            {t("live.draft.text", {
              points: draft.points.length,
              km: trackDistanceKm(draft.points).toFixed(2),
            })}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleResume}
              className="flex-1 rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
            >
              {t("live.draft.resume")}
            </button>
            <button
              type="button"
              onClick={handleFinishDraft}
              className="flex-1 rounded-xl bg-trail-900 py-3 text-sm font-semibold text-white transition hover:bg-trail-800"
            >
              {t("live.draft.finish")}
            </button>
          </div>
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="text-sm font-semibold text-trail-500 hover:underline"
          >
            {t("live.draft.discard")}
          </button>
        </div>
      )}

      {status === "idle" && (
        <button
          type="button"
          onClick={handleStart}
          className="w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
        >
          {t("live.start")}
        </button>
      )}

      {status === "requesting" && (
        <p className="rounded-xl border border-trail-200 bg-white p-4 text-center text-sm text-trail-600">
          {t("live.activating")}
        </p>
      )}

      {isRecording && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-trail-200 bg-white p-4 text-center">
              <p className="font-display text-2xl tracking-wide text-trail-900">
                {formatDuration(elapsedSeconds)}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-trail-500">{t("live.duration")}</p>
            </div>
            <div className="rounded-xl border border-trail-200 bg-white p-4 text-center">
              <p className="font-display text-2xl tracking-wide text-trail-900">
                {distanceKm.toFixed(2)} km
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-trail-500">{t("live.distance")}</p>
            </div>
            <div className="rounded-xl border border-trail-200 bg-white p-4 text-center">
              <p className="font-display text-2xl tracking-wide text-trail-900">
                {points.length}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-trail-500">
                {t("live.points")}
              </p>
            </div>
          </div>

          {gpsWarning && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {gpsWarning}
            </p>
          )}
          {gapNotice && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {gapNotice}
            </p>
          )}
          {!wakeLock.supported && (
            <p className="text-xs text-trail-500">
              {t("live.noWakeLock")}
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
            {status === "finishing" ? t("live.saving") : t("live.finish")}
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
            {t("live.retry")}
          </button>
        </div>
      )}
    </div>
  );
}
