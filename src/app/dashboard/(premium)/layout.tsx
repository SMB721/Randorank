import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPaidTier } from "@/lib/gating";
import type { SubscriptionTier } from "@/lib/supabase/types";

// Paywall for the whole app: /dashboard/abonnement, /profil, /export and
// /installer live outside this group so a user without an active
// subscription can still subscribe, manage billing and export their data
// (GDPR). Server actions re-check the tier themselves — this layout only
// guards page navigation.
export default async function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, onboarding_completed_at")
    .eq("id", user.id)
    .single<{ subscription_tier: SubscriptionTier; onboarding_completed_at: string | null }>();

  // Funnel order: questionnaire first, then paywall, then the app.
  if (!profile?.onboarding_completed_at) {
    redirect("/bienvenue");
  }

  if (!isPaidTier(profile?.subscription_tier ?? "freemium")) {
    redirect("/bienvenue/paywall");
  }

  return <>{children}</>;
}
