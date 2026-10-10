"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/app/server";

export type SaveLiveHikeInput = {
  name: string;
  coordinates: [number, number][];
  distanceKm: number;
  elevationGainM: number;
  durationSeconds: number;
  avgSpeedKmh: number;
  startedAt: string | null;
  isValid: boolean;
  validationNotes: string | null;
  /** Thinned altitudes (see sampleElevations), or null when unavailable. */
  elevations: number[] | null;
};

export type SaveLiveHikeResult =
  | { success: true; id: string }
  | { success: false; error: string };

// Recording and saving hikes is free for everyone (anonymous accounts
// included): it is the habit the whole product is built on.
// The client thins the altitudes, but the database must not trust its input.
function validElevations(value: number[] | null): number[] | null {
  if (!Array.isArray(value) || value.length < 2 || value.length > 2000) return null;
  return value.every((v) => Number.isFinite(v)) ? value : null;
}

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

  const { data, error } = await supabase
    .rpc("create_hike", {
      p_name: input.name,
      p_source: "live_recording",
      p_coordinates: input.coordinates,
      p_distance_km: input.distanceKm,
      p_elevation_gain_m: input.elevationGainM,
      p_duration_seconds: input.durationSeconds,
      p_avg_speed_kmh: input.avgSpeedKmh,
      p_started_at: input.startedAt,
      p_is_valid: input.isValid,
      p_validation_notes: input.validationNotes,
      p_elevations: validElevations(input.elevations),
    })
    .single<{ id: string }>();

  if (error || !data) {
    return { success: false, error: error?.message ?? t("live.saveError") };
  }

  revalidatePath("/dashboard/randos");
  revalidatePath("/dashboard");

  return { success: true, id: data.id };
}
