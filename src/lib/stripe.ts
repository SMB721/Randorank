import Stripe from "stripe";

// Single server-side Stripe client. Never import this from a client
// component — it reads the secret key.
//
// A placeholder fallback keeps the constructor from throwing at module
// evaluation time when the key isn't configured yet (any page that merely
// imports a subscription action would otherwise crash on load, not just
// the checkout flow itself). Real API calls still fail cleanly with an
// auth error, which callers catch and turn into a friendly message.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_not_configured");

export type PaidTier = "premium" | "vip";
export type BillingPeriod = "monthly" | "yearly";

export const PRICE_IDS: Record<PaidTier, Record<BillingPeriod, string | undefined>> = {
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
  },
  vip: {
    monthly: process.env.STRIPE_PRICE_VIP_MONTHLY,
    yearly: process.env.STRIPE_PRICE_VIP_YEARLY,
  },
};

// Reverse lookup used by the webhook to resolve a Stripe price back to our
// own tier, regardless of whether it's the monthly or yearly price.
export function tierForPriceId(priceId: string): PaidTier | null {
  for (const tier of Object.keys(PRICE_IDS) as PaidTier[]) {
    if (PRICE_IDS[tier].monthly === priceId || PRICE_IDS[tier].yearly === priceId) {
      return tier;
    }
  }
  return null;
}
