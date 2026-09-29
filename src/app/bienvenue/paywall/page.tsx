import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPaidTier } from "@/lib/gating";
import PaywallScreen from "@/components/onboarding/PaywallScreen";
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS, LEVEL_OPTIONS } from "@/lib/onboarding";
import type { Profile } from "@/lib/supabase/types";

export const metadata = { title: "Votre profil est prêt — RandoRank" };

type Recap = Pick<
  Profile,
  | "first_name"
  | "region"
  | "usual_area"
  | "declared_level"
  | "hiking_experience"
  | "goal"
  | "subscription_tier"
  | "onboarding_completed_at"
>;

const label = (options: { value: string; label: string }[], value: string | null) =>
  options.find((o) => o.value === value)?.label ?? null;

// Last screen of the funnel: questionnaire -> here -> app. Reached from the
// questionnaire and from the (premium) layout when there is no active
// subscription, so an unpaid user lands back here on every login.
export default async function PaywallPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
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
    .select(
      "first_name, region, usual_area, declared_level, hiking_experience, goal, subscription_tier, onboarding_completed_at"
    )
    .eq("id", user.id)
    .single<Recap>();

  if (!profile?.onboarding_completed_at) {
    redirect("/bienvenue");
  }
  if (isPaidTier(profile.subscription_tier)) {
    redirect("/dashboard");
  }

  const { checkout } = await searchParams;

  return (
    <PaywallScreen
      firstName={profile.first_name}
      level={label(LEVEL_OPTIONS, profile.declared_level)}
      experience={label(EXPERIENCE_OPTIONS, profile.hiking_experience)}
      region={profile.region}
      area={profile.usual_area}
      goal={profile.goal}
      goalLabel={label(GOAL_OPTIONS, profile.goal)}
      checkoutStatus={checkout ?? null}
    />
  );
}
