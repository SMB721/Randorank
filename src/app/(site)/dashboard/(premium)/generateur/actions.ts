"use server";

import { createClient } from "@/lib/supabase/server";
import { classifyRouteLevel, generateRoundTripRoute, GraphHopperError } from "@/lib/graphhopper";
import { isPaidTier } from "@/lib/gating";
import type { SubscriptionTier, UserLevel } from "@/lib/supabase/types";
import { getT } from "@/lib/i18n/app/server";

const MAX_ATTEMPTS = 3;
const MIN_DISTANCE_KM = 2;
const MAX_DISTANCE_KM = 40;

export type GenerateRouteInput = {
  lat: number;
  lon: number;
  distanceKm: number;
  niveau: UserLevel | null; // null = peu importe
};

export type GeneratedRouteResult = {
  coordinates: [number, number][];
  distanceKm: number;
  elevationGainM: number;
  niveau: UserLevel;
};

export type GenerateRouteResponse =
  | { success: true; route: GeneratedRouteResult }
  | { success: false; error: string };

// Round_trip proposals vary with the seed, so a few attempts is enough to
// often land on a loop matching the requested difficulty — this is the
// "filtrage / classement selon le niveau demandé" step from §5, applied
// after the routing engine rather than before it.
export async function generateRouteAction(
  input: GenerateRouteInput
): Promise<GenerateRouteResponse> {
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
    return { success: false, error: t("gen.err.premium") };
  }

  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lon)) {
    return { success: false, error: t("gen.err.badStart") };
  }
  if (
    !Number.isFinite(input.distanceKm) ||
    input.distanceKm < MIN_DISTANCE_KM ||
    input.distanceKm > MAX_DISTANCE_KM
  ) {
    return {
      success: false,
      error: t("gen.err.distance", { min: MIN_DISTANCE_KM, max: MAX_DISTANCE_KM }),
    };
  }

  let fallback: GeneratedRouteResult | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let candidate: GeneratedRouteResult;
    try {
      const seed = Math.floor(Math.random() * 1_000_000);
      const generated = await generateRoundTripRoute({
        lat: input.lat,
        lon: input.lon,
        distanceKm: input.distanceKm,
        seed,
      });
      candidate = { ...generated, niveau: classifyRouteLevel(generated.distanceKm, generated.elevationGainM) };
    } catch (err) {
      if (err instanceof GraphHopperError) {
        const error =
          err.code === "keyMissing"
            ? t("gen.err.keyMissing")
            : err.code === "noRoute"
              ? t("gen.err.noRoute")
              : (err.detail ?? t("gen.err.serviceFailed"));
        return { success: false, error };
      }
      return { success: false, error: t("gen.err.unexpected") };
    }

    if (!input.niveau || candidate.niveau === input.niveau) {
      return { success: true, route: candidate };
    }
    fallback = fallback ?? candidate;
  }

  if (fallback) {
    return { success: true, route: fallback };
  }
  return { success: false, error: t("gen.err.failed") };
}

export type SaveRouteResponse =
  | { success: true; routeId: string }
  | { success: false; error: string };

export async function saveRouteAction(
  route: GeneratedRouteResult,
  name: string
): Promise<SaveRouteResponse> {
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
    return { success: false, error: t("gen.err.premium") };
  }

  const { data, error } = await supabase
    .rpc("create_route", {
      p_name: name.trim() || t("gen.savedName"),
      p_coordinates: route.coordinates,
      p_distance_km: route.distanceKm,
      p_elevation_gain_m: route.elevationGainM,
      p_niveau: route.niveau,
      p_region: null,
    })
    .single<{ id: string }>();

  if (error || !data) {
    return { success: false, error: error?.message ?? t("gen.err.saveFailed") };
  }

  return { success: true, routeId: data.id };
}
