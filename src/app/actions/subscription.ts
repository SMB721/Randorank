"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS, type BillingPeriod, type PaidTier } from "@/lib/stripe";
import { PREMIUM_TRIAL_DAYS } from "@/lib/pricing";
import { STRIPE_LOCALES } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";

export async function createCheckoutSessionAction(tier: PaidTier, period: BillingPeriod) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const priceId = PRICE_IDS[tier][period];
  if (!priceId) {
    redirect("/bienvenue/paywall?checkout=error");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, subscription_tier, subscription_status")
    .eq("id", user!.id)
    .single<{
      stripe_customer_id: string | null;
      subscription_tier: string;
      subscription_status: string;
    }>();

  // Already subscribed (to this tier or another) — send to the portal
  // instead of starting a second, conflicting subscription.
  if (
    profile?.stripe_customer_id &&
    ["active", "trialing"].includes(profile.subscription_status)
  ) {
    redirect("/dashboard/profil");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Stripe's hosted page follows the language the visitor was reading.
  const locale = STRIPE_LOCALES[await getRequestLocale()];

  let checkoutUrl: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      locale,
      line_items: [{ price: priceId, quantity: 1 }],
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.stripe_customer_id ? undefined : (user!.email ?? undefined),
      client_reference_id: user!.id,
      // Card is always collected up front; the first charge happens when the
      // trial ends. Only users who never completed a checkout get the trial,
      // so cancelling and resubscribing can't chain free weeks.
      payment_method_collection: "always",
      subscription_data: {
        metadata: { supabase_user_id: user!.id },
        ...(profile?.stripe_customer_id ? {} : { trial_period_days: PREMIUM_TRIAL_DAYS }),
      },
      metadata: { supabase_user_id: user!.id },
      success_url: `${siteUrl}/bienvenue/paywall?checkout=success`,
      cancel_url: `${siteUrl}/bienvenue/paywall?checkout=canceled`,
    });
    checkoutUrl = session.url;
  } catch {
    redirect("/bienvenue/paywall?checkout=error");
  }

  if (!checkoutUrl) {
    redirect("/bienvenue/paywall?checkout=error");
  }

  redirect(checkoutUrl);
}

export async function createPortalSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user!.id)
    .single<{ stripe_customer_id: string | null }>();

  if (!profile?.stripe_customer_id) {
    redirect("/dashboard/profil?checkout=error");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let portalUrl: string | null = null;
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile!.stripe_customer_id!,
      locale: STRIPE_LOCALES[await getRequestLocale()],
      return_url: `${siteUrl}/dashboard/profil`,
    });
    portalUrl = portalSession.url;
  } catch {
    redirect("/dashboard/profil?checkout=error");
  }

  redirect(portalUrl ?? "/dashboard/profil?checkout=error");
}
