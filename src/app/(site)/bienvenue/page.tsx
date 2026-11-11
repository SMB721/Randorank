import { nicknameRequired } from "@/lib/nickname";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { EMPTY_ANSWERS } from "@/lib/onboarding";
import { getFunnelDict } from "@/lib/i18n/funnel";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  return { title: getFunnelDict(await getRequestLocale()).onboarding.metaTitle };
}

export default async function BienvenuePage() {
  const locale = await getRequestLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/start");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at, username, created_at")
    .eq("id", user.id)
    .single<{ onboarding_completed_at: string | null; username: string | null; created_at: string }>();

  // A new member with no nickname goes through the funnel again, even if it
  // was completed once: the app is closed to them until they pick one.
  // Older nameless accounts are left alone (see lib/nickname.ts).
  if (
    profile?.onboarding_completed_at &&
    (profile.username?.trim() || !nicknameRequired(profile.created_at))
  ) {
    redirect("/dashboard");
  }

  return (
    <OnboardingFlow
      locale={locale}
      dict={getFunnelDict(locale).onboarding}
      initial={{
        ...EMPTY_ANSWERS,
        username: profile?.username ?? "",
      }}
    />
  );
}
