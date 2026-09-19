import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionTier } from "@/lib/supabase/types";

// Freemium is meant to hook people, not replace Premium/VIP — a weekly cap
// keeps the funnel real. Premium and VIP stay unlimited.
export const FREEMIUM_WEEKLY_HIKE_LIMIT = 1;

export type QuotaStatus = {
  isLimited: boolean;
  used: number;
  limit: number;
  remaining: number;
  quotaExceeded: boolean;
};

const UNLIMITED: QuotaStatus = {
  isLimited: false,
  used: 0,
  limit: Infinity,
  remaining: Infinity,
  quotaExceeded: false,
};

// Only valid hikes count — a hike rejected for a GPS glitch shouldn't burn
// through a freemium user's weekly allowance for something out of their
// control.
export async function getHikeQuotaStatus(
  supabase: SupabaseClient,
  userId: string,
  subscriptionTier: SubscriptionTier
): Promise<QuotaStatus> {
  if (subscriptionTier !== "freemium") {
    return UNLIMITED;
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { count } = await supabase
    .from("hikes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_valid", true)
    .gte("created_at", weekAgo.toISOString());

  const used = count ?? 0;

  return {
    isLimited: true,
    used,
    limit: FREEMIUM_WEEKLY_HIKE_LIMIT,
    remaining: Math.max(0, FREEMIUM_WEEKLY_HIKE_LIMIT - used),
    quotaExceeded: used >= FREEMIUM_WEEKLY_HIKE_LIMIT,
  };
}

// Matches the pricing page ("Jusqu'à 3 photos par rando" on Freemium).
export const FREEMIUM_PHOTOS_PER_HIKE_LIMIT = 3;

export async function getPhotoQuotaStatus(
  supabase: SupabaseClient,
  hikeId: string,
  subscriptionTier: SubscriptionTier
): Promise<QuotaStatus> {
  if (subscriptionTier !== "freemium") {
    return UNLIMITED;
  }

  const { count } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("hike_id", hikeId);

  const used = count ?? 0;

  return {
    isLimited: true,
    used,
    limit: FREEMIUM_PHOTOS_PER_HIKE_LIMIT,
    remaining: Math.max(0, FREEMIUM_PHOTOS_PER_HIKE_LIMIT - used),
    quotaExceeded: used >= FREEMIUM_PHOTOS_PER_HIKE_LIMIT,
  };
}
