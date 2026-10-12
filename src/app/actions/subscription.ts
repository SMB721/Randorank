"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS, type BillingPeriod, type PaidTier } from "@/lib/stripe";
import { STRIPE_LOCALES } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import {
  CANCELLATION_COMMENT_MAX,
  isCancellationReason,
} from "@/lib/cancellation";

export async function createCheckoutSessionAction(tier: PaidTier, period: BillingPeriod) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  // Stripe needs a real identity to bill and to find the account again.
  // Guests link an email/Google account first, then come straight back.
  if (user.is_anonymous) {
    redirect("/auth?mode=signup&next=/bienvenue/paywall");
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
      // No trial: Premium is billed at checkout. The free tier is the way to
      // try the app before paying.
      subscription_data: {
        metadata: { supabase_user_id: user!.id },
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
    redirect("/start");
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

/**
 * Cancellation survey, then Stripe. The survey is optional ("skip" goes
 * straight to Stripe) and never blocks the cancellation: a failed insert
 * must not trap someone who wants to leave.
 */
export async function submitCancellationSurveyAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, subscription_status")
    .eq("id", user!.id)
    .single<{ stripe_customer_id: string | null; subscription_status: string }>();

  if (!profile?.stripe_customer_id) {
    redirect("/dashboard/profil?checkout=error");
  }

  const reason = formData.get("reason");
  if (formData.get("skip") === null) {
    if (!isCancellationReason(reason)) {
      redirect("/dashboard/resiliation?error=reason");
    }
    const rawComment = formData.get("comment");
    const comment =
      typeof rawComment === "string" && rawComment.trim()
        ? rawComment.trim().slice(0, CANCELLATION_COMMENT_MAX)
        : null;
    await supabase.from("cancellation_surveys").insert({
      user_id: user!.id,
      reason,
      comment,
      subscription_status: profile!.subscription_status,
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const returnUrl = `${siteUrl}/dashboard/profil`;

  let portalUrl: string | null = null;
  try {
    // Deep-link to Stripe's cancel confirmation when we can find the
    // subscription; otherwise fall back to the portal home.
    const subs = await stripe.subscriptions.list({
      customer: profile!.stripe_customer_id!,
      status: "all",
      limit: 5,
    });
    const current = subs.data.find((sub) => ["active", "trialing", "past_due"].includes(sub.status));

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile!.stripe_customer_id!,
      locale: STRIPE_LOCALES[await getRequestLocale()],
      return_url: returnUrl,
      ...(current
        ? {
            flow_data: {
              type: "subscription_cancel" as const,
              subscription_cancel: { subscription: current.id },
              after_completion: { type: "redirect" as const, redirect: { return_url: returnUrl } },
            },
          }
        : {}),
    });
    portalUrl = portalSession.url;
  } catch {
    redirect("/dashboard/profil?checkout=error");
  }

  redirect(portalUrl ?? "/dashboard/profil?checkout=error");
}
