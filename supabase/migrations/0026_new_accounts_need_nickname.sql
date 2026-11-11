-- New accounts must pick a nickname (the app sends them to the sign-up flow
-- until they do), so one that has not yet done it stays out of the rankings
-- instead of showing up as "Randonneur anonyme". Accounts created before the
-- cutoff are left as they are: those without a nickname keep their place.
-- Keep the cutoff in sync with NICKNAME_REQUIRED_SINCE in src/lib/nickname.ts.

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
    partition by country
    order by total_distance_km desc, hike_count desc, created_at asc
  ) as national_rank,
  row_number() over (
    partition by region
    order by total_distance_km desc, hike_count desc, created_at asc
  ) as regional_rank,
  country
from public.profiles p
where (p.username is not null or p.created_at < timestamptz '2026-11-11 00:00:00+00')
  and not exists (
    select 1 from auth.users u where u.id = p.id and u.is_anonymous
  );

grant select on public.profiles_public to authenticated;
