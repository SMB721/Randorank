"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isPaidTier } from "@/lib/gating";
import type { SubscriptionTier } from "@/lib/supabase/types";
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
};

export type SaveLiveHikeResult =
  | { success: true; id: string }
  | { success: false; error: string };

// The page-load quota check on /dashboard/randos/live only gates whether the
// recorder renders at all — it says nothing about a session that was already
// running when the week's quota filled up, and it's trivially bypassed by
// calling the client straight from the browser. This is the actual
// enforcement point, mirroring the GPX import action.
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
    })
    .single<{ id: string }>();

  if (error || !data) {
    return { success: false, error: error?.message ?? t("live.saveError") };
  }

  revalidatePath("/dashboard/randos");
  revalidatePath("/dashboard");

  return { success: true, id: data.id };
}
