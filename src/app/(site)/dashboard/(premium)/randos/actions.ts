"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeStats, parseGpx } from "@/lib/gpx";
import { isPaidTier } from "@/lib/gating";
import type { SubscriptionTier } from "@/lib/supabase/types";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export type ImportGpxResult =
  | { success: true; warning: string | null }
  | { success: false; error: string };

export async function importGpxAction(formData: FormData): Promise<ImportGpxResult> {
  const file = formData.get("gpx");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Sélectionnez un fichier GPX." };
  }
  if (!file.name.toLowerCase().endsWith(".gpx")) {
    return { success: false, error: "Le fichier doit être au format .gpx." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: "Fichier trop volumineux (5 Mo max)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté·e." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single<{ subscription_tier: SubscriptionTier }>();

  if (!isPaidTier(profile?.subscription_tier ?? "freemium")) {
    return {
      success: false,
      error: "Un abonnement Premium actif est nécessaire pour enregistrer une rando.",
    };
  }

  let parsed;
  try {
    const xml = await file.text();
    parsed = parseGpx(xml);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Fichier GPX illisible.",
    };
  }

  const stats = computeStats(parsed.points);
  const coordinates = parsed.points.map((p) => [p.lon, p.lat]);
  const name =
    parsed.name ||
    `Randonnée du ${new Date(stats.startedAt ?? Date.now()).toLocaleDateString("fr-FR")}`;

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

  return { success: true, warning: stats.isValid ? null : stats.validationNotes };
}
