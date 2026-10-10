import type { SubscriptionTier } from "@/lib/supabase/types";

// Freemium: everyone gets in and records hikes for free; Premium unlocks the
// route generator at full power plus the polish (clean share card, unlimited
// photos, every challenge). The "freemium" value in the DB enum means "no
// active subscription" — the default for new accounts and the fallback when
// Stripe reports a canceled/unpaid subscription.
//
// This file is the single place that decides what each tier may do. Pages
// and server actions import the helpers below instead of comparing tiers
// themselves, so moving a feature between free and paid is a one-line edit.
// Server actions must still call these: a page-level lock is only UX.

export function isPaidTier(tier: SubscriptionTier): boolean {
  return tier === "premium" || tier === "vip";
}

/** Free-tier ceilings. Premium is unlimited on all of them. */
export const FREE_LIMITS = {
  /** Generated routes per calendar month (each one costs a routing-API call). */
  routeGenerationsPerMonth: 2,
  /** Photos attached to a single hike. */
  photosPerHike: 3,
  /** Challenges the user can take part in at once (the oldest one is open). */
  openChallenges: 1,
} as const;

/** `null` means "no limit". */
export function routeGenerationLimit(tier: SubscriptionTier): number | null {
  return isPaidTier(tier) ? null : FREE_LIMITS.routeGenerationsPerMonth;
}

export function photosPerHikeLimit(tier: SubscriptionTier): number | null {
  return isPaidTier(tier) ? null : FREE_LIMITS.photosPerHike;
}

export function openChallengesLimit(tier: SubscriptionTier): number | null {
  return isPaidTier(tier) ? null : FREE_LIMITS.openChallenges;
}

/** Saving generated routes to the personal library. */
export function canSaveRoutes(tier: SubscriptionTier): boolean {
  return isPaidTier(tier);
}

/** Share card without the RandoRank footer strip. */
export function hasCleanShareCard(tier: SubscriptionTier): boolean {
  return isPaidTier(tier);
}

/** First day of the current month (UTC), the start of the quota window. */
export function currentQuotaWindowStart(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

/**
 * Next-gen generator: several variants to compare, a maximum-elevation cap
 * and one-way routes. The basic single loop stays available to everyone.
 */
export function hasAdvancedGenerator(tier: SubscriptionTier): boolean {
  return isPaidTier(tier);
}

/** Variants Premium gets back per generation (free gets a single route). */
export const PREMIUM_VARIANTS = 3;

/** Records, 12-month trends, streaks, estimated energy, per-hike analysis. */
export function hasAdvancedStats(tier: SubscriptionTier): boolean {
  return isPaidTier(tier);
}
