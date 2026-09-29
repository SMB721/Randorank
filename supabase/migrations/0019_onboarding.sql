-- Onboarding questionnaire answers, collected between sign-up and the
-- paywall. `declared_level` is what the user *says* their level is; the
-- computed `user_level` (driven by cumulative km, see 0002) stays the source
-- of truth for leaderboards and is never touched by the questionnaire.
alter table public.profiles
  add column first_name text,
  add column last_name text,
  add column declared_level text,
  add column hiking_experience text,
  add column hikes_per_month text,
  add column usual_area text,
  add column goal text,
  add column typical_distance text,
  add column gear text,
  add column referral_source text,
  add column onboarding_completed_at timestamptz;

alter table public.profiles
  add constraint profiles_first_name_len check (first_name is null or char_length(first_name) between 1 and 50),
  add constraint profiles_last_name_len check (last_name is null or char_length(last_name) between 1 and 50),
  add constraint profiles_declared_level_chk check (declared_level is null or declared_level in ('debutant', 'amateur', 'avance')),
  add constraint profiles_experience_chk check (hiking_experience is null or hiking_experience in ('lt_1y', '1_3y', '3_10y', 'gt_10y')),
  add constraint profiles_frequency_chk check (hikes_per_month is null or hikes_per_month in ('lt_1', '1_2', '3_4', 'gt_5')),
  add constraint profiles_usual_area_len check (usual_area is null or char_length(usual_area) <= 80),
  add constraint profiles_goal_chk check (goal is null or goal in ('challenge', 'fitness', 'photos', 'discovery')),
  add constraint profiles_distance_chk check (typical_distance is null or typical_distance in ('lt_10', '10_20', '20_30', 'gt_30')),
  add constraint profiles_gear_chk check (gear is null or gear in ('gps_watch', 'phone_app', 'none')),
  add constraint profiles_referral_chk check (referral_source is null or referral_source in ('friends', 'instagram', 'tiktok', 'search', 'strava', 'other'));

grant update (
  first_name, last_name, declared_level, hiking_experience, hikes_per_month,
  usual_area, goal, typical_distance, gear, referral_source, onboarding_completed_at
) on public.profiles to authenticated;

-- Accounts that already pay skip the funnel; everyone else goes through it
-- on next login (it feeds regional leaderboards, so we want them too).
update public.profiles
  set onboarding_completed_at = now()
  where subscription_tier <> 'freemium';
