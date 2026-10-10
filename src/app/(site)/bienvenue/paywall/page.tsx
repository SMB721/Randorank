import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPaidTier } from "@/lib/gating";
import PaywallScreen from "@/components/onboarding/PaywallScreen";
import {
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  localizeOptions,
} from "@/lib/onboarding";
import { getFunnelDict } from "@/lib/i18n/funnel";
import { getRequestLocale } from "@/lib/i18n/server";
import { getT } from "@/lib/i18n/app/server";
import type { Profile } from "@/lib/supabase/types";

export async function generateMetadata() {
  return { title: getFunnelDict(await getRequestLocale()).paywall.metaTitle };
}

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

// The Premium offer. Reached from the questionnaire's last screen and from
// every upsell in the app; nobody is forced through it any more — the app is
// free, so there is always a "continue for free" way out.
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
    redirect("/start");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, region, usual_area, declared_level, hiking_experience, goal, subscription_tier, onboarding_completed_at"
    )
    .eq("id", user.id)
    .single<Recap>();

  if (profile && isPaidTier(profile.subscription_tier)) {
    redirect("/dashboard");
  }

  const { checkout } = await searchParams;
  const locale = await getRequestLocale();
  const { t: appT } = await getT();
  const dict = getFunnelDict(locale);
  const { options } = dict.onboarding;

  return (
    <PaywallScreen
      locale={locale}
      dict={dict.paywall}
      firstName={profile?.first_name ?? null}
      level={label(localizeOptions(LEVEL_OPTIONS, options.level), profile?.declared_level ?? null)}
      experience={label(
        localizeOptions(EXPERIENCE_OPTIONS, options.experience),
        profile?.hiking_experience ?? null
      )}
      region={profile?.region ?? null}
      area={profile?.usual_area ?? null}
      goal={profile?.goal ?? null}
      goalLabel={label(localizeOptions(GOAL_OPTIONS, options.goal), profile?.goal ?? null)}
      checkoutStatus={checkout ?? null}
      freeNote={appT("paywall.freeNote")}
      skipLabel={appT("paywall.skip")}
    />
  );
}
