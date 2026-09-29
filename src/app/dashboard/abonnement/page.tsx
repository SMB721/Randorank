import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PricingSection from "@/components/home/PricingSection";
import { createClient } from "@/lib/supabase/server";
import { isPaidTier } from "@/lib/gating";
import { SUBSCRIPTION_LABELS, type Profile } from "@/lib/supabase/types";

export default async function AbonnementPage() {
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
    .single<Pick<Profile, "subscription_tier" | "onboarding_completed_at">>();

  if (!profile?.onboarding_completed_at) {
    redirect("/bienvenue");
  }
  // No active subscription: the paywall lives in the funnel, not here.
  if (!isPaidTier(profile.subscription_tier)) {
    redirect("/bienvenue/paywall");
  }

  return (
    <main className="min-h-screen bg-trail-50 px-6 py-6">
      <DashboardHeader />

      <div className="mx-auto mt-10 max-w-6xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
          Offres
        </span>
        <h1 className="mt-3 font-display text-4xl tracking-wide text-trail-900 sm:text-5xl">
          Le Monchu ou Le MUL.
        </h1>
        <p className="mt-4 text-trail-600">
          Offre actuelle :{" "}
          <span className="font-semibold text-trail-900">
            {profile ? SUBSCRIPTION_LABELS[profile.subscription_tier] : "…"}
          </span>
        </p>

        <div className="mt-12">
          <PricingSection />
        </div>
      </div>
    </main>
  );
}
