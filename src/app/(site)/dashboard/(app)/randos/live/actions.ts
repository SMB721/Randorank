"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/app/server";
import { computeStats, type TrackPoint } from "@/lib/gpx";
import { sampleElevations } from "@/lib/elevationProfile";

/**
 * One recorded fix, in a compact form so a long hike stays well under the
 * request size limit: [lat, lon, altitude (m) or null, unix seconds,
 * 1 when recording was interrupted just before this point, else 0].
 */
export type LivePointTuple = [number, number, number | null, number, 0 | 1];

// The server recomputes every figure from the points: distance, climb,
// duration, speed and the validity flag are never taken from the client, so
// a forged request cannot simply declare a big hike.
export type SaveLiveHikeInput = {
  name: string;
  points: LivePointTuple[];
};

const MAX_POINTS = 60_000;
const MAX_AGE_MS = 72 * 60 * 60 * 1000;
const MAX_FUTURE_MS = 5 * 60 * 1000;

/** Rebuilds track points from the request, or null when anything is off. */
function parsePoints(raw: unknown, nowMs: number): TrackPoint[] | null {
  if (!Array.isArray(raw) || raw.length < 2 || raw.length > MAX_POINTS) return null;
  const points: TrackPoint[] = [];
  let latestSeconds = -Infinity;
  for (const entry of raw) {
    if (!Array.isArray(entry) || entry.length !== 5) return null;
    const [lat, lon, ele, seconds, gap] = entry as unknown[];
    if (
      typeof lat !== "number" || !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      typeof lon !== "number" || !Number.isFinite(lon) || lon < -180 || lon > 180 ||
      typeof seconds !== "number" || !Number.isFinite(seconds) ||
      (ele !== null && (typeof ele !== "number" || !Number.isFinite(ele))) ||
      (gap !== 0 && gap !== 1)
    ) {
      return null;
    }
    // Every point must carry a clock (the type guarantees a number): without
    // timestamps the speed checks would be skipped. Out-of-order or duplicate
    // times are a known browser quirk and are handled by computeStats.
    latestSeconds = Math.max(latestSeconds, seconds);
    points.push({
      lat,
      lon,
      ele,
      time: new Date(seconds * 1000).toISOString(),
      ...(gap === 1 && points.length > 0 ? { segmentStart: true } : {}),
    });
  }
  const lastMs = latestSeconds * 1000;
  if (lastMs > nowMs + MAX_FUTURE_MS || lastMs < nowMs - MAX_AGE_MS) return null;
  return points;
}

export type SaveLiveHikeResult =
  | { success: true; id: string }
  | { success: false; error: string };

// Recording and saving hikes is free for everyone (anonymous accounts
// included): it is the habit the whole product is built on.
export async function saveLiveHikeAction(
  input: SaveLiveHikeInput
): Promise<SaveLiveHikeResult> {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: t("action.notLoggedIn") };
  }

  const points = parsePoints(input?.points, Date.now());
  if (!points) {
    return { success: false, error: t("live.saveError") };
  }
  const stats = computeStats(points);
  const name =
    typeof input.name === "string" && input.name.trim()
      ? input.name.trim().slice(0, 120)
      : t("live.saveError");

  const { data, error } = await supabase
    .rpc("create_hike", {
      p_name: name,
      p_source: "live_recording",
      p_coordinates: points.map((p) => [p.lon, p.lat]),
      p_distance_km: stats.distanceKm,
      p_elevation_gain_m: stats.elevationGainM,
      p_duration_seconds: stats.durationSeconds,
      p_avg_speed_kmh: stats.avgSpeedKmh,
      p_started_at: stats.startedAt,
      p_is_valid: stats.isValid,
      p_validation_notes: stats.validationNotes,
      p_elevations: sampleElevations(points.map((p) => p.ele)),
    })
    .single<{ id: string }>();

  if (error || !data) {
    return { success: false, error: error?.message ?? t("live.saveError") };
  }

  revalidatePath("/dashboard/randos");
  revalidatePath("/dashboard");

  return { success: true, id: data.id };
}
