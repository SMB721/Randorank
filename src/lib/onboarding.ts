// Shared by the onboarding UI and the server action that validates it, so
// the two can never drift apart on allowed values.

export type Option = { value: string; label: string; hint?: string; emoji?: string };

export const LEVEL_OPTIONS: Option[] = [
  { value: "debutant", label: "Débutant", hint: "Le sentier, c'est tout nouveau", emoji: "🌱" },
  { value: "amateur", label: "Amateur", hint: "Je connais mes classiques", emoji: "🥾" },
  { value: "avance", label: "Avancé", hint: "Les sommets, c'est mon cardio", emoji: "🏔️" },
];

export const EXPERIENCE_OPTIONS: Option[] = [
  { value: "lt_1y", label: "Moins d'un an", emoji: "🐣" },
  { value: "1_3y", label: "1 à 3 ans", emoji: "🧭" },
  { value: "3_10y", label: "3 à 10 ans", emoji: "🎒" },
  { value: "gt_10y", label: "Plus de 10 ans", emoji: "🦅" },
];

export const FREQUENCY_OPTIONS: Option[] = [
  { value: "lt_1", label: "Moins d'une fois par mois", hint: "Quand la météo s'y prête" },
  { value: "1_2", label: "1 à 2 fois par mois" },
  { value: "3_4", label: "3 à 4 fois par mois", hint: "Chaque week-end ou presque" },
  { value: "gt_5", label: "5 fois ou plus", hint: "Vous habitez sur le sentier" },
];

export const GOAL_OPTIONS: Option[] = [
  { value: "challenge", label: "Me challenger et grimper au classement", emoji: "🏆" },
  { value: "fitness", label: "Rester en forme", emoji: "💪" },
  { value: "photos", label: "Ramener de belles photos", emoji: "📸" },
  { value: "discovery", label: "Découvrir de nouveaux coins", emoji: "🗺️" },
];

export const DISTANCE_OPTIONS: Option[] = [
  { value: "lt_10", label: "Moins de 10 km", hint: "La balade qui fait du bien" },
  { value: "10_20", label: "10 à 20 km", hint: "La journée classique" },
  { value: "20_30", label: "20 à 30 km", hint: "On aime souffrir un peu" },
  { value: "gt_30", label: "Plus de 30 km", hint: "Les jambes, ça se garde pour plus tard" },
];

export const GEAR_OPTIONS: Option[] = [
  { value: "gps_watch", label: "Une montre GPS", hint: "Garmin, Coros, Suunto, Apple Watch…", emoji: "⌚" },
  { value: "phone_app", label: "Une appli sur mon téléphone", hint: "Strava, Komoot, Visorando…", emoji: "📱" },
  { value: "none", label: "Rien pour l'instant", hint: "On s'occupe de tout", emoji: "🤷" },
];

export const REFERRAL_OPTIONS: Option[] = [
  { value: "friends", label: "Un·e ami·e", emoji: "🤝" },
  { value: "instagram", label: "Instagram", emoji: "📷" },
  { value: "tiktok", label: "TikTok", emoji: "🎬" },
  { value: "strava", label: "Strava", emoji: "🟠" },
  { value: "search", label: "Une recherche Google", emoji: "🔎" },
  { value: "other", label: "Autre", emoji: "✨" },
];

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

const values = (opts: Option[]) => opts.map((o) => o.value);

// Returns the first validation error, or null. Used both to gate the "Next"
// button per step and, on the server, to re-check the whole payload.
export function validateAnswers(
  a: OnboardingAnswers,
  regions: readonly string[]
): string | null {
  if (!a.firstName.trim() || !a.lastName.trim()) return "Prénom et nom, s'il vous plaît.";
  if (a.firstName.trim().length > 50 || a.lastName.trim().length > 50) return "Prénom ou nom trop long.";
  const u = a.username.trim();
  if (u.length < 2 || u.length > 30) return "Choisissez un pseudo de 2 à 30 caractères.";
  if (!values(LEVEL_OPTIONS).includes(a.declaredLevel)) return "Choisissez votre niveau.";
  if (!values(EXPERIENCE_OPTIONS).includes(a.experience)) return "Depuis combien de temps randonnez-vous ?";
  if (!values(FREQUENCY_OPTIONS).includes(a.frequency)) return "À quelle fréquence randonnez-vous ?";
  if (!regions.includes(a.region)) return "Choisissez votre région.";
  if (a.usualArea.trim().length > 80) return "Lieu trop long (80 caractères max).";
  if (!values(GOAL_OPTIONS).includes(a.goal)) return "Choisissez un objectif.";
  if (!values(DISTANCE_OPTIONS).includes(a.typicalDistance)) return "Choisissez une distance habituelle.";
  if (!values(GEAR_OPTIONS).includes(a.gear)) return "Choisissez votre matériel.";
  if (!values(REFERRAL_OPTIONS).includes(a.referral)) return "Dites-nous comment vous nous avez connus.";
  if (!a.consent) return "Le consentement est nécessaire pour continuer.";
  return null;
}
