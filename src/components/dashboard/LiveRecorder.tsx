"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { haversineKm, trackDistanceKm, type TrackPoint } from "@/lib/gpx";
import { clearDraft, loadDraft, saveDraft, type LiveDraft } from "@/lib/liveDraft";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useT } from "@/lib/i18n/app/client";
import { sunsetAt } from "@/lib/sun";
import {
  saveLiveHikeAction,
  type LivePointTuple,
} from "@/app/(site)/dashboard/(app)/randos/live/actions";

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

const LiveMap3D = dynamic(() => import("./LiveMap3D"), {
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
// Phone altitude is noisy: a climb only counts once it adds up to this many
// meters, so GPS jitter on flat ground doesn't inflate the elevation gain.
const ELEVATION_STEP_M = 3;
// Live calorie estimate for a reference 70 kg hiker: about 0.8 kcal/kg per
// km walked plus 0.01 kcal/kg per meter climbed. Shown as an estimate.
const REFERENCE_WEIGHT_KG = 70;

function elevationGainM(points: TrackPoint[]): number {
  let gain = 0;
  let anchor: number | null = null;
  for (const p of points) {
    if (p.ele === null) continue;
    if (anchor === null || p.segmentStart) {
      anchor = p.ele;
      continue;
    }
    const diff = p.ele - anchor;
    if (diff >= ELEVATION_STEP_M) {
      gain += diff;
      anchor = p.ele;
    } else if (diff <= -ELEVATION_STEP_M) {
      anchor = p.ele;
    }
  }
  return Math.round(gain);
}

function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.01" />
    </svg>
  );
}

function LiveStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-trail-500">{label}</p>
      <p className="mt-0.5 text-[2rem] font-extrabold leading-tight tracking-tight text-trail-950 tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-base font-bold text-trail-700">{unit}</span>}
      </p>
    </div>
  );
}

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
  const [is3D, setIs3D] = useState(false);
  const [basemap, setBasemap] = useState<"satellite" | "plan">("satellite");

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

    // Only the raw fixes leave the phone: the server recomputes the stats.
    const name = t("hike.defaultName", { date: new Date().toLocaleDateString(locale) });
    const result = await saveLiveHikeAction({
      name,
      points: track.map((p): LivePointTuple => [
        Number(p.lat.toFixed(6)),
        Number(p.lon.toFixed(6)),
        p.ele === null ? null : Number(p.ele.toFixed(1)),
        p.time ? Math.round(new Date(p.time).getTime() / 1000) : 0,
        p.segmentStart ? 1 : 0,
      ]),
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
  const gainM = useMemo(() => elevationGainM(points), [points]);
  const hasElevation = useMemo(() => points.some((p) => p.ele !== null), [points]);
  const speedKmh = elapsedSeconds > 60 ? distanceKm / (elapsedSeconds / 3600) : 0;
  const caloriesKcal = Math.round(REFERENCE_WEIGHT_KG * (0.8 * distanceKm + 0.01 * gainM));
  const lastPoint = points.length > 0 ? points[points.length - 1] : null;
  const altitudeM = lastPoint && lastPoint.ele !== null ? Math.round(lastPoint.ele) : null;
  // Recomputed only when the position moves enough to matter (~1 km).
  const sunLat = lastPoint ? Math.round(lastPoint.lat * 100) / 100 : null;
  const sunLon = lastPoint ? Math.round(lastPoint.lon * 100) / 100 : null;
  const sunsetLabel = useMemo(() => {
    if (sunLat === null || sunLon === null) return null;
    const sunset = sunsetAt(sunLat, sunLon);
    return sunset
      ? sunset.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      : null;
  }, [sunLat, sunLon, locale]);

  return (
    <div className="space-y-4">
      {!isRecording && (
        <div className="flex gap-3 rounded-2xl border border-trail-200 bg-white px-4 py-3 text-sm text-trail-700">
          <span className="text-summit-600"><InfoIcon /></span>
          <p>{t("live.keepOpen")}</p>
        </div>
      )}

      {status === "idle" && draft && (
        <div className="space-y-3 rounded-2xl border border-summit-200 bg-summit-50 p-4">
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
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-summit-500 py-4 text-base font-bold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
          {t("live.start")}
        </button>
      )}

      {status === "requesting" && (
        <p className="rounded-2xl border border-trail-200 bg-white p-4 text-center text-sm text-trail-600">
          {t("live.activating")}
        </p>
      )}

      {isRecording && (
        <div className="-mx-6 sm:mx-0">
          <div className="relative h-[46vh] min-h-72 overflow-hidden sm:rounded-3xl">
            {is3D ? <LiveMap3D points={points} basemap={basemap} /> : <LiveMap points={points} basemap={basemap} />}
            <div className="absolute left-3 top-3 z-[500] flex gap-2">
              <button
                type="button"
                onClick={() => setBasemap((b) => (b === "satellite" ? "plan" : "satellite"))}
                aria-label={basemap === "satellite" ? t("map.showPlan") : t("map.showSatellite")}
                className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-trail-950 shadow-lg transition hover:bg-trail-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m12 3 9 5-9 5-9-5z" />
                  <path d="m3 13 9 5 9-5" />
                </svg>
                {basemap === "satellite" ? t("map.plan") : t("map.satellite")}
              </button>
              <button
                type="button"
                onClick={() => setIs3D((v) => !v)}
                aria-pressed={is3D}
                aria-label={is3D ? t("map3d.show2d") : t("map3d.show3d")}
                className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold shadow-lg transition ${
                  is3D ? "bg-summit-500 text-white" : "bg-white text-trail-950 hover:bg-trail-50"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3 3 7.5l9 4.5 9-4.5z" />
                  <path d="M3 7.5v9L12 21l9-4.5v-9M12 12v9" />
                </svg>
                {is3D ? "2D" : "3D"}
              </button>
            </div>
          </div>

          <div className="relative z-[500] -mt-7 rounded-t-[28px] bg-white px-6 pb-6 pt-3 shadow-[0_-10px_30px_rgba(15,26,12,0.10)] sm:mt-4 sm:rounded-[28px] sm:border sm:border-trail-100">
            <div aria-hidden="true" className="mx-auto h-1.5 w-10 rounded-full bg-trail-200" />

            <div
              className={`mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 ${
                gpsWarning ? "bg-amber-50" : "bg-trail-50"
              }`}
            >
              <span className="relative flex h-3 w-3 shrink-0">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                    gpsWarning ? "bg-amber-500" : "bg-trail-500"
                  }`}
                />
                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${
                    gpsWarning ? "bg-amber-500" : "bg-trail-600"
                  }`}
                />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-trail-950">{t("live.recordingNow")}</p>
                <p className={`text-sm ${gpsWarning ? "text-amber-800" : "text-trail-600"}`}>
                  {gpsWarning ? t("live.weakSignal") : t("live.gpsOk")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
              <LiveStat label={t("live.duration")} value={formatClock(elapsedSeconds)} />
              <LiveStat label={t("live.distance")} value={distanceKm.toFixed(2)} unit="km" />
              <LiveStat
                label={t("live.elevation")}
                value={hasElevation ? String(gainM) : "—"}
                unit={hasElevation ? "m" : undefined}
              />
              <LiveStat
                label={t("live.altitude")}
                value={altitudeM !== null ? String(altitudeM) : "—"}
                unit={altitudeM !== null ? "m" : undefined}
              />
              <LiveStat
                label={t("live.speed")}
                value={speedKmh > 0 ? speedKmh.toFixed(1) : "—"}
                unit={speedKmh > 0 ? "km/h" : undefined}
              />
              <LiveStat
                label={t("live.calories")}
                value={distanceKm > 0 ? String(caloriesKcal) : "—"}
                unit={distanceKm > 0 ? "kcal" : undefined}
              />
            </div>

            {sunsetLabel && (
              <p className="mt-5 flex items-center gap-2.5 text-sm text-trail-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-summit-500">
                  <path d="M7 16a5 5 0 0 1 10 0M3 16h18M12 4v4M4.9 8.9l1.4 1.4M19.1 8.9l-1.4 1.4M9.5 20l2.5-2 2.5 2" />
                </svg>
                {t("live.sunset", { time: sunsetLabel })}
              </p>
            )}

            {gapNotice && (
              <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <InfoIcon />
                {gapNotice}
              </p>
            )}

            <button
              type="button"
              onClick={handleStop}
              disabled={status === "finishing"}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-trail-950 py-4 text-base font-bold text-white transition hover:bg-trail-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span aria-hidden="true" className="h-3.5 w-3.5 rounded-[3px] bg-summit-500" />
              {status === "finishing" ? t("live.saving") : t("live.finish")}
            </button>

            <p className="mt-3 flex justify-center gap-1.5 text-center text-xs text-trail-500">
              <InfoIcon />
              {wakeLock.supported ? t("live.keepOpenShort") : t("live.noWakeLock")}
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="w-full rounded-2xl border-2 border-trail-900 py-3 text-sm font-semibold text-trail-900 transition hover:bg-trail-900 hover:text-white"
          >
            {t("live.retry")}
          </button>
        </div>
      )}
    </div>
  );
}
