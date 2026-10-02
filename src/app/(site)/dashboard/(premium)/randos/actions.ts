"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeStats, formatValidationNotes, gpxErrorMessage, parseGpx } from "@/lib/gpx";
import { getT } from "@/lib/i18n/app/server";
import { isPaidTier } from "@/lib/gating";
import type { SubscriptionTier } from "@/lib/supabase/types";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single<{ subscription_tier: SubscriptionTier }>();

  if (!isPaidTier(profile?.subscription_tier ?? "freemium")) {
    return {
      success: false,
      error: t("action.premiumRequired"),
    };
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
