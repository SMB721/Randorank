import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPaidTier } from "@/lib/gating";
import type { Profile } from "@/lib/supabase/types";

// There is a single offer, so there is no plan-comparison page any more.
// Kept as a redirect so old links and bookmarks still land somewhere useful:
// subscribers manage billing from their profile (Stripe portal), everyone
// else goes to the funnel paywall.
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
  redirect(isPaidTier(profile.subscription_tier) ? "/dashboard/profil" : "/bienvenue/paywall");
}
