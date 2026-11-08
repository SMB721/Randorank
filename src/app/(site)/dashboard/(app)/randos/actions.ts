"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeStats, formatValidationNotes, gpxErrorMessage, parseGpx } from "@/lib/gpx";
import { getT } from "@/lib/i18n/app/server";
import { sampleElevations } from "@/lib/elevationProfile";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export type ImportGpxResult =
  | { success: true; warning: string | null }
  | { success: false; error: string };

export async function importGpxAction(formData: FormData): Promise<ImportGpxResult> {
  const tr = await getT();
  const { t } = tr;
  const file = formData.get("gpx");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: t("gpx.selectFile") };
  }
  if (!file.name.toLowerCase().endsWith(".gpx")) {
    return { success: false, error: t("gpx.badExtension") };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: t("gpx.tooBig") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: t("action.notLoggedIn") };
  }

  let parsed;
  try {
    const xml = await file.text();
    parsed = parseGpx(xml);
  } catch (err) {
    return {
      success: false,
      error: gpxErrorMessage(err, tr),
    };
  }

  const stats = computeStats(parsed.points);
  const coordinates = parsed.points.map((p) => [p.lon, p.lat]);
  const name =
    parsed.name ||
    t("hike.defaultName", {
      date: new Date(stats.startedAt ?? Date.now()).toLocaleDateString(tr.locale),
    });

  const { error } = await supabase.rpc("create_hike", {
    p_name: name,
    p_source: "gpx_import",
    p_coordinates: coordinates,
    p_distance_km: stats.distanceKm,
    p_elevation_gain_m: stats.elevationGainM,
    p_duration_seconds: stats.durationSeconds,
    p_avg_speed_kmh: stats.avgSpeedKmh,
    p_started_at: stats.startedAt,
    p_is_valid: stats.isValid,
    p_validation_notes: stats.validationNotes,
    // Kept for the Premium per-hike altitude profile; null when the file has
    // too few altitudes to draw an honest one.
    p_elevations: sampleElevations(parsed.points.map((p) => p.ele)),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/randos");
  revalidatePath("/dashboard");

  return {
    success: true,
    warning: stats.isValid ? null : formatValidationNotes(stats.validationNotes, tr),
  };
}

export type DeleteHikeResult = { success: true } | { success: false; error: string };

export async function deleteHikeAction(hikeId: string): Promise<DeleteHikeResult> {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: t("action.notLoggedIn") };
  }

  const { data: hike } = await supabase
    .from("hikes")
    .select("id, user_id")
    .eq("id", hikeId)
    .single<{ id: string; user_id: string }>();

  if (!hike || hike.user_id !== user.id) {
    return { success: false, error: t("hike.delete.notFound") };
  }

  // Photo rows go with the hike (on delete cascade), but the files in
  // Storage don't: remove them first so nothing is left orphaned.
  const { data: photos } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("hike_id", hikeId)
    .returns<{ storage_path: string }[]>();
  const paths = (photos ?? []).map((p) => p.storage_path);
  if (paths.length > 0) {
    await supabase.storage.from("photos").remove(paths);
  }

  // RLS only lets the owner delete; the on_hike_change trigger then
  // recalculates their totals and level, and rankings/challenges are read
  // live from the remaining hikes.
  const { error } = await supabase.from("hikes").delete().eq("id", hikeId);
  if (error) {
    return { success: false, error: t("hike.delete.error") };
  }

  revalidatePath("/dashboard/randos");
  revalidatePath("/dashboard");
  return { success: true };
}
