import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { EMPTY_ANSWERS } from "@/lib/onboarding";

export const metadata = { title: "Bienvenue — RandoRank" };

export default async function BienvenuePage() {
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
      initial={{
        ...EMPTY_ANSWERS,
        username: profile?.username ?? "",
        region: profile?.region ?? "",
      }}
    />
  );
}
