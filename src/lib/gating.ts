import type { SubscriptionTier } from "@/lib/supabase/types";

// There is no free tier: the app is paid-only (see CLAUDE.md §7). The
// "freemium" value stays in the DB enum purely as "no active subscription"
// — the default for new sign-ups and the fallback when Stripe reports a
// canceled/unpaid subscription — so no migration is needed. Every gate
// (the (premium) layout and each server action) reads "is this tier paid"
// from here, so the rule can still change in one place.
export function isPaidTier(tier: SubscriptionTier): boolean {
  return tier === "premium" || tier === "vip";
}
