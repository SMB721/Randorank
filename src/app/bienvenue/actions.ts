"use server";

import { createClient } from "@/lib/supabase/server";
import { FRENCH_REGIONS } from "@/lib/supabase/types";
import { validateAnswers, type OnboardingAnswers } from "@/lib/onboarding";

export async function completeOnboardingAction(
  answers: OnboardingAnswers
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Vous devez être connecté·e." };
  }

  const invalid = validateAnswers(answers, FRENCH_REGIONS);
  if (invalid) {
    return { success: false, error: invalid };
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
    return {
      success: false,
      error:
        error.code === "23505"
          ? "Ce pseudo est déjà pris, essayez-en un autre."
          : "Impossible d'enregistrer vos réponses, réessayez.",
    };
  }

  return { success: true };
}
