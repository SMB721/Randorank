-- Country of the hiker (ISO 3166-1 alpha-2, "ZZ" = other). It replaces the
-- French-only region as the way to place a profile on a leaderboard: the
-- product now targets English-speaking countries too. Existing accounts are
-- all French, hence the default. The old `region` column stays (not dropped,
-- the data is kept) but is no longer collected.
alter table public.profiles
  add column country text not null default 'FR';

alter table public.profiles
  add constraint profiles_country_chk check (country ~ '^[A-Z]{2}$');

grant update (country) on public.profiles to authenticated;

-- Same definition as 0020 (anonymous accounts stay out of the rankings);
-- `country` is appended last, which is what CREATE OR REPLACE VIEW requires.
create or replace view public.profiles_public
as
select
  id,
  username,
  avatar_url,
  region,
  user_level,
  total_distance_km,
  total_elevation_m,
  hike_count,
  subscription_tier,
  row_number() over (
    order by total_distance_km desc, hike_count desc, created_at asc
  ) as national_rank,
  row_number() over (
    partition by region
    order by total_distance_km desc, hike_count desc, created_at asc
  ) as regional_rank,
  country
from public.profiles p
where not exists (
  select 1 from auth.users u where u.id = p.id and u.is_anonymous
);

grant select on public.profiles_public to authenticated;
