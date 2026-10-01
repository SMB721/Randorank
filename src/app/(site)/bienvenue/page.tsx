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
    redirect("/auth?mode=login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at, username, region")
    .eq("id", user.id)
    .single<{ onboarding_completed_at: string | null; username: string | null; region: string | null }>();

  if (profile?.onboarding_completed_at) {
    redirect("/dashboard");
  }

  return (
    <OnboardingFlow
      locale={locale}
      dict={getFunnelDict(locale).onboarding}
      initial={{
        ...EMPTY_ANSWERS,
        username: profile?.username ?? "",
        region: profile?.region ?? "",
      }}
    />
  );
}
