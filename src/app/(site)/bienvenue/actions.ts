"use server";

import { createClient } from "@/lib/supabase/server";
import { FRENCH_REGIONS } from "@/lib/supabase/types";
import { validateAnswers, type OnboardingAnswers } from "@/lib/onboarding";
import { getFunnelDict } from "@/lib/i18n/funnel";
import { getRequestLocale } from "@/lib/i18n/server";

export async function completeOnboardingAction(
  answers: OnboardingAnswers
): Promise<{ success: true } | { success: false; error: string; step?: number }> {
  // The visitor's language comes from the cookie set on the landing page.
  const { errors } = getFunnelDict(await getRequestLocale()).onboarding;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: errors.notLoggedIn };
  }

  const invalid = validateAnswers(answers, FRENCH_REGIONS);
  if (invalid) {
    // Only the username error is fixed on the first screen; the client
    // sends the user back there.
    return {
      success: false,
      error: errors[invalid],
      step: invalid === "nameRequired" || invalid === "nameTooLong" || invalid === "usernameLength" ? 0 : undefined,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: answers.firstName.trim(),
      last_name: answers.lastName.trim(),
      username: answers.username.trim(),
      declared_level: answers.declaredLevel,
      hiking_experience: answers.experience,
      hikes_per_month: answers.frequency,
      region: answers.region,
      usual_area: answers.usualArea.trim() || null,
      goal: answers.goal,
      typical_distance: answers.typicalDistance,
      gear: answers.gear,
      referral_source: answers.referral,
      blur_endpoints: answers.blurEndpoints,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("completeOnboardingAction failed:", error.code, error.message);
    // 23505 = unique violation: the username is taken (fixed on screen 1).
    return error.code === "23505"
      ? { success: false, error: errors.usernameTaken, step: 0 }
      : { success: false, error: errors.saveFailed };
  }

  return { success: true };
}
