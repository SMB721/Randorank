"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS, type BillingPeriod, type PaidTier } from "@/lib/stripe";

const TRIAL_PERIOD_DAYS = 5;

export async function createCheckoutSessionAction(tier: PaidTier, period: BillingPeriod) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?mode=login&redirect=/dashboard/profil`);
  }

  const priceId = PRICE_IDS[tier][period];
  if (!priceId) {
    redirect("/dashboard/profil?checkout=error");
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

  let checkoutUrl: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.stripe_customer_id ? undefined : (user!.email ?? undefined),
      client_reference_id: user!.id,
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: { supabase_user_id: user!.id },
      },
      metadata: { supabase_user_id: user!.id },
      success_url: `${siteUrl}/dashboard/profil?checkout=success`,
      cancel_url: `${siteUrl}/dashboard/profil?checkout=canceled`,
    });
    checkoutUrl = session.url;
  } catch {
    redirect("/dashboard/profil?checkout=error");
  }

  if (!checkoutUrl) {
    redirect("/dashboard/profil?checkout=error");
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
      return_url: `${siteUrl}/dashboard/profil`,
    });
    portalUrl = portalSession.url;
  } catch {
    redirect("/dashboard/profil?checkout=error");
  }

  redirect(portalUrl ?? "/dashboard/profil?checkout=error");
}
