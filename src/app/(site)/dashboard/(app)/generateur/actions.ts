"use server";

import { createClient } from "@/lib/supabase/server";
import {
  classifyRouteLevel,
  generateOneWayRoute,
  generateRoundTripRoute,
  GraphHopperError,
  type GeneratedRoute,
} from "@/lib/graphhopper";
import {
  canSaveRoutes,
  hasAdvancedGenerator,
  PREMIUM_VARIANTS,
  routeGenerationLimit,
} from "@/lib/gating";
import { countMonthlyGenerations } from "@/lib/quota";
import type { SubscriptionTier, UserLevel } from "@/lib/supabase/types";
import { getT } from "@/lib/i18n/app/server";

const MAX_ATTEMPTS = 3;
const MIN_DISTANCE_KM = 2;
const MAX_DISTANCE_KM = 40;
const MIN_MAX_ELEVATION_M = 50;
const MAX_MAX_ELEVATION_M = 3000;
// Premium asks the router for a few more candidates than it returns, so the
// elevation cap and the level preference still leave PREMIUM_VARIANTS routes.
const PREMIUM_CANDIDATES = 5;

export type RouteMode = "loop" | "oneway";

export type GenerateRouteInput = {
  lat: number;
  lon: number;
  distanceKm: number;
  niveau: UserLevel | null; // null = peu importe
  /** Premium only. Defaults to a loop. */
  mode?: RouteMode;
  /** Premium only: reject routes climbing more than this. null = no cap. */
  maxElevationM?: number | null;
};

/** Why a variant stands out among the proposals (Premium comparison). */
export type VariantTag = "flat" | "steep" | "exact";

export type GeneratedRouteResult = {
  coordinates: [number, number][];
  /** Altitude in metres per coordinate, for the elevation profile. */
  elevations: number[];
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  niveau: UserLevel;
  tag?: VariantTag;
};

/** `limit` is null for Premium (unlimited); `used` includes this generation. */
export type RouteQuota = { used: number; limit: number | null };

export type GenerateRouteResponse =
  | {
      success: true;
      routes: GeneratedRouteResult[];
      quota: RouteQuota;
      /** Set when no candidate respected the elevation cap and the gentlest ones were kept. */
      elevationCapRelaxed: boolean;
    }
  | { success: false; error: string };

type Candidate = GeneratedRouteResult;

function toCandidate(route: GeneratedRoute): Candidate {
  return { ...route, niveau: classifyRouteLevel(route.distanceKm, route.elevationGainM) };
}

function routingErrorMessage(err: unknown, t: Awaited<ReturnType<typeof getT>>["t"]): string {
  if (err instanceof GraphHopperError) {
    return err.code === "keyMissing"
      ? t("gen.err.keyMissing")
      : err.code === "noRoute"
        ? t("gen.err.noRoute")
        : (err.detail ?? t("gen.err.serviceFailed"));
  }
  return t("gen.err.unexpected");
}

// Round_trip proposals vary with the seed, so a few attempts is enough to
// often land on a loop matching the requested difficulty — this is the
// "filtrage / classement selon le niveau demandé" step from §5, applied
// after the routing engine rather than before it.
async function generateSingleLoop(input: GenerateRouteInput): Promise<Candidate> {
  let fallback: Candidate | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const generated = await generateRoundTripRoute({
      lat: input.lat,
      lon: input.lon,
      distanceKm: input.distanceKm,
      seed: Math.floor(Math.random() * 1_000_000),
    });
    const candidate = toCandidate(generated);
    if (!input.niveau || candidate.niveau === input.niveau) return candidate;
    fallback = fallback ?? candidate;
  }
  return fallback as Candidate;
}

// Premium: several candidates in parallel (loops with different seeds, or
// one-way routes fanned out around the compass), then filter by the
// elevation cap, prefer the requested level and the right distance, and keep
// the best distinct few.
async function generateVariants(
  input: GenerateRouteInput,
  maxElevationM: number | null
): Promise<{ routes: Candidate[]; capRelaxed: boolean }> {
  const startBearing = Math.random() * 360;
  const jobs = Array.from({ length: PREMIUM_CANDIDATES }, (_, i) =>
    input.mode === "oneway"
      ? generateOneWayRoute({
          lat: input.lat,
          lon: input.lon,
          distanceKm: input.distanceKm,
          bearingDeg: (startBearing + (360 / PREMIUM_CANDIDATES) * i) % 360,
        })
      : generateRoundTripRoute({
          lat: input.lat,
          lon: input.lon,
          distanceKm: input.distanceKm,
          seed: Math.floor(Math.random() * 1_000_000),
        })
  );

  const settled = await Promise.allSettled(jobs);
  const candidates = settled
    .filter((r): r is PromiseFulfilledResult<GeneratedRoute> => r.status === "fulfilled")
    .map((r) => toCandidate(r.value));

  if (candidates.length === 0) {
    // Surface the router's own error (no key, no route…) instead of a generic one.
    const failure = settled.find((r): r is PromiseRejectedResult => r.status === "rejected");
    throw failure?.reason ?? new GraphHopperError("noRoute");
  }

  // Drop near-duplicates: two candidates within 2% on both distance and
  // climb are the same walk for the user.
  const distinct = candidates.filter(
    (c, i) =>
      !candidates
        .slice(0, i)
        .some(
          (o) =>
            Math.abs(o.distanceKm - c.distanceKm) / c.distanceKm < 0.02 &&
            Math.abs(o.elevationGainM - c.elevationGainM) <= Math.max(10, c.elevationGainM * 0.02)
        )
  );

  let pool = distinct;
  let capRelaxed = false;
  if (maxElevationM !== null) {
    const withinCap = distinct.filter((c) => c.elevationGainM <= maxElevationM);
    if (withinCap.length > 0) {
      pool = withinCap;
    } else {
      capRelaxed = true;
      pool = [...distinct].sort((a, b) => a.elevationGainM - b.elevationGainM);
    }
  }

  const distanceGap = (c: Candidate) => Math.abs(c.distanceKm - input.distanceKm);
  const ranked = [...pool].sort((a, b) => {
    const levelA = input.niveau && a.niveau === input.niveau ? 0 : 1;
    const levelB = input.niveau && b.niveau === input.niveau ? 0 : 1;
    return levelA - levelB || distanceGap(a) - distanceGap(b);
  });

  return { routes: tagVariants(ranked.slice(0, PREMIUM_VARIANTS), input.distanceKm), capRelaxed };
}

// Labels what makes each variant different, so the choice is obvious at a
// glance. Needs at least two routes to be meaningful, and one tag per route.
function tagVariants(routes: Candidate[], targetKm: number): Candidate[] {
  if (routes.length < 2) return routes;
  const tags = new Map<Candidate, VariantTag>();
  const claim = (route: Candidate, tag: VariantTag) => {
    if (!tags.has(route)) tags.set(route, tag);
  };
  claim(
    routes.reduce((a, b) => (b.elevationGainM < a.elevationGainM ? b : a)),
    "flat"
  );
  claim(
    routes.reduce((a, b) => (b.elevationGainM > a.elevationGainM ? b : a)),
    "steep"
  );
  claim(
    routes.reduce((a, b) =>
      Math.abs(b.distanceKm - targetKm) < Math.abs(a.distanceKm - targetKm) ? b : a
    ),
    "exact"
  );
  return routes.map((r) => ({ ...r, tag: tags.get(r) }));
}

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
  const tier = profile?.subscription_tier ?? "freemium";
  const advanced = hasAdvancedGenerator(tier);

  const mode: RouteMode = input.mode === "oneway" ? "oneway" : "loop";
  const maxElevationM =
    input.maxElevationM === null || input.maxElevationM === undefined ? null : input.maxElevationM;

  // The options are Premium, and the UI locks them — but the UI is only UX.
  if (!advanced && (mode === "oneway" || maxElevationM !== null)) {
    return { success: false, error: t("gen.err.premiumOption") };
  }
  if (
    maxElevationM !== null &&
    (!Number.isFinite(maxElevationM) ||
      maxElevationM < MIN_MAX_ELEVATION_M ||
      maxElevationM > MAX_MAX_ELEVATION_M)
  ) {
    return {
      success: false,
      error: t("gen.err.maxElevation", { min: MIN_MAX_ELEVATION_M, max: MAX_MAX_ELEVATION_M }),
    };
  }

  // Free accounts get a few generations a month; Premium is unlimited. The
  // count is read before the (paid) routing call so an exhausted quota never
  // costs an API request.
  const limit = routeGenerationLimit(tier);
  let usedBefore = 0;
  if (limit !== null) {
    usedBefore = await countMonthlyGenerations(supabase, user.id);
    if (usedBefore >= limit) {
      return { success: false, error: t("gen.err.quota", { n: limit }) };
    }
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

  let routes: Candidate[];
  let capRelaxed = false;
  try {
    if (advanced) {
      const result = await generateVariants({ ...input, mode }, maxElevationM);
      routes = result.routes;
      capRelaxed = result.capRelaxed;
    } else {
      routes = [await generateSingleLoop(input)];
    }
  } catch (err) {
    return { success: false, error: routingErrorMessage(err, t) };
  }

  if (routes.length === 0) {
    return { success: false, error: t("gen.err.failed") };
  }

  // A generation counts against the quota only once the user actually gets a
  // route back, so routing failures never burn a free try.
  if (limit !== null) {
    await supabase.from("route_generations").insert({ user_id: user.id });
  }

  return {
    success: true,
    routes,
    quota: { used: limit === null ? 0 : usedBefore + 1, limit },
    elevationCapRelaxed: capRelaxed,
  };
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

  if (!canSaveRoutes(profile?.subscription_tier ?? "freemium")) {
    return { success: false, error: t("gen.err.savePremium") };
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
