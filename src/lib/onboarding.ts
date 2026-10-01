// Shared by the onboarding UI and the server action that validates it, so
// the two can never drift apart on allowed values. User-facing labels live in
// the per-locale funnel dictionaries (lib/i18n/funnel); only the stored
// values and emoji are defined here.

import type { FunnelDict } from "@/lib/i18n/funnel";

export type OptionDef = { value: string; emoji?: string };
export type Option = OptionDef & { label: string; hint?: string };

export const LEVEL_OPTIONS: OptionDef[] = [
  { value: "debutant", emoji: "🌱" },
  { value: "amateur", emoji: "🥾" },
  { value: "avance", emoji: "🏔️" },
];

export const EXPERIENCE_OPTIONS: OptionDef[] = [
  { value: "lt_1y", emoji: "🐣" },
  { value: "1_3y", emoji: "🧭" },
  { value: "3_10y", emoji: "🎒" },
  { value: "gt_10y", emoji: "🦅" },
];

export const FREQUENCY_OPTIONS: OptionDef[] = [
  { value: "lt_1" },
  { value: "1_2" },
  { value: "3_4" },
  { value: "gt_5" },
];

export const GOAL_OPTIONS: OptionDef[] = [
  { value: "challenge", emoji: "🏆" },
  { value: "fitness", emoji: "💪" },
  { value: "photos", emoji: "📸" },
  { value: "discovery", emoji: "🗺️" },
];

export const DISTANCE_OPTIONS: OptionDef[] = [
  { value: "lt_10" },
  { value: "10_20" },
  { value: "20_30" },
  { value: "gt_30" },
];

export const GEAR_OPTIONS: OptionDef[] = [
  { value: "gps_watch", emoji: "⌚" },
  { value: "phone_app", emoji: "📱" },
  { value: "none", emoji: "🤷" },
];

export const REFERRAL_OPTIONS: OptionDef[] = [
  { value: "friends", emoji: "🤝" },
  { value: "instagram", emoji: "📷" },
  { value: "tiktok", emoji: "🎬" },
  { value: "strava", emoji: "🟠" },
  { value: "search", emoji: "🔎" },
  { value: "other", emoji: "✨" },
];

/** Attaches the dictionary's label (and optional hint) to each option. */
export function localizeOptions(
  defs: OptionDef[],
  texts: Record<string, { label: string; hint?: string }>
): Option[] {
  return defs.map((d) => ({ ...d, ...texts[d.value] }));
}

export type OnboardingAnswers = {
  firstName: string;
  lastName: string;
  username: string;
  declaredLevel: string;
  experience: string;
  frequency: string;
  region: string;
  usualArea: string;
  goal: string;
  typicalDistance: string;
  gear: string;
  referral: string;
  blurEndpoints: boolean;
  consent: boolean;
};

export const EMPTY_ANSWERS: OnboardingAnswers = {
  firstName: "",
  lastName: "",
  username: "",
  declaredLevel: "",
  experience: "",
  frequency: "",
  region: "",
  usualArea: "",
  goal: "",
  typicalDistance: "",
  gear: "",
  referral: "",
  blurEndpoints: true,
  consent: false,
};

const values = (opts: OptionDef[]) => opts.map((o) => o.value);

export type OnboardingErrorKey = keyof FunnelDict["onboarding"]["errors"];

// Returns the key of the first validation error (its message is looked up in
// the visitor's language), or null. Used both to gate the "Next" button per
// step and, on the server, to re-check the whole payload.
export function validateAnswers(
  a: OnboardingAnswers,
  regions: readonly string[]
): OnboardingErrorKey | null {
  if (!a.firstName.trim() || !a.lastName.trim()) return "nameRequired";
  if (a.firstName.trim().length > 50 || a.lastName.trim().length > 50) return "nameTooLong";
  const u = a.username.trim();
  if (u.length < 2 || u.length > 30) return "usernameLength";
  if (!values(LEVEL_OPTIONS).includes(a.declaredLevel)) return "level";
  if (!values(EXPERIENCE_OPTIONS).includes(a.experience)) return "experience";
  if (!values(FREQUENCY_OPTIONS).includes(a.frequency)) return "frequency";
  if (!regions.includes(a.region)) return "region";
  if (a.usualArea.trim().length > 80) return "areaTooLong";
  if (!values(GOAL_OPTIONS).includes(a.goal)) return "goal";
  if (!values(DISTANCE_OPTIONS).includes(a.typicalDistance)) return "distance";
  if (!values(GEAR_OPTIONS).includes(a.gear)) return "gear";
  if (!values(REFERRAL_OPTIONS).includes(a.referral)) return "referral";
  if (!a.consent) return "consent";
  return null;
}
