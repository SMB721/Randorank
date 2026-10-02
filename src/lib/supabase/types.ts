export type UserLevel = "debutant" | "amateur" | "avance";
export type SubscriptionTier = "freemium" | "premium" | "vip";

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  region: string | null;
  birth_date: string | null;
  user_level: UserLevel;
  total_distance_km: number;
  total_elevation_m: number;
  hike_count: number;
  subscription_tier: SubscriptionTier;
  subscription_status: string;
  stripe_customer_id: string | null;
  install_prompt_seen: boolean;
  free_route_used: boolean;
  first_name: string | null;
  last_name: string | null;
  declared_level: string | null;
  hiking_experience: string | null;
  hikes_per_month: string | null;
  usual_area: string | null;
  goal: string | null;
  typical_distance: string | null;
  gear: string | null;
  referral_source: string | null;
  onboarding_completed_at: string | null;
  blur_endpoints: boolean;
  created_at: string;
  updated_at: string;
};

export type HikeSource = "gpx_import" | "live_recording" | "generated";

export type Hike = {
  id: string;
  user_id: string;
  name: string;
  source: HikeSource;
  distance_km: number;
  elevation_gain_m: number;
  duration_seconds: number;
  avg_speed_kmh: number;
  started_at: string | null;
  is_valid: boolean;
  validation_notes: string | null;
  created_at: string;
};

export type HikeWithTrack = Hike & {
  track_geojson: { type: "LineString"; coordinates: [number, number][] };
};

export type Photo = {
  id: string;
  hike_id: string;
  user_id: string;
  storage_path: string;
  lat: number | null;
  lon: number | null;
  taken_at: string | null;
  created_at: string;
};

export type PublicProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  region: string | null;
  user_level: UserLevel;
  total_distance_km: number;
  total_elevation_m: number;
  hike_count: number;
  subscription_tier: SubscriptionTier;
  national_rank: number;
  regional_rank: number;
};

export type BadgeMetric =
  | "hike_count"
  | "total_distance_km"
  | "total_elevation_m"
  | "user_level";

export type Badge = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  metric: BadgeMetric;
  threshold: number;
  created_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export type Route = {
  id: string;
  created_by: string;
  name: string;
  distance_km: number;
  elevation_gain_m: number;
  niveau: UserLevel;
  region: string | null;
  created_at: string;
};

export type RouteWithTrack = Route & {
  track_geojson: { type: "LineString"; coordinates: [number, number][] };
};

export type ChallengeMetric =
  | "hike_count"
  | "distance_km_sum"
  | "elevation_gain_m_sum"
  | "elevation_gain_m_max";

export type Challenge = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  metric: ChallengeMetric;
  threshold: number;
  period_start: string;
  period_end: string;
  created_at: string;
};

export type ChallengeProgressRow = {
  challenge_id: string;
  user_id: string;
  username: string | null;
  region: string | null;
  progress: number;
  rank: number;
};

export type CommunityStats = {
  total_km: number;
  total_elevation_m: number;
  total_hikes: number;
  total_hikers: number;
};

export type CommunityWeeklyKm = {
  week_start: string;
  km: number;
};

export type Spot = {
  id: string;
  name: string;
  region: string;
  short_story: string;
  image_url: string;
  created_at: string;
};

export const FRENCH_REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Belgique",
  "Luxembourg",
  "Suisse",
  "Autre / étranger",
] as const;

export const USER_LEVELS: UserLevel[] = ["debutant", "amateur", "avance"];

export const USER_LEVEL_LABELS: Record<UserLevel, string> = {
  debutant: "Débutant",
  amateur: "Amateur",
  avance: "Avancé",
};

// Distance thresholds (km) that gate the next level. Mirrored in the
// recalculate_profile_stats() trigger (supabase/migrations/0002_hikes.sql),
// which is the actual source of truth — this copy only drives the
// dashboard's progress bar without a round trip.
export const LEVEL_THRESHOLDS_KM: Record<UserLevel, number | null> = {
  debutant: 50,
  amateur: 200,
  avance: null,
};

export const NEXT_LEVEL: Record<UserLevel, UserLevel | null> = {
  debutant: "amateur",
  amateur: "avance",
  avance: null,
};

export const SUBSCRIPTION_LABELS: Record<SubscriptionTier, string> = {
  freemium: "Sans abonnement",
  premium: "Le MUL · Premium",
  vip: "Le Thru-Hiker · VIP",
};
