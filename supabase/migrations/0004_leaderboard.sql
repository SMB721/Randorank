-- Public leaderboard (§8: région/niveau filters must exist from the first
-- screen, so both are computed here rather than bolted on later).
--
-- profiles' own RLS restricts SELECT to "own row only" (0001_profiles.sql)
-- — correct for the account/settings screens, wrong for a leaderboard.
-- Rather than loosen that policy (which would also expose email-adjacent
-- and billing columns), this view exposes only the safe subset and is
-- created WITHOUT security_invoker, so it runs with the view owner's
-- privileges and deliberately bypasses the underlying row-level
-- restriction — the standard Postgres/Supabase pattern for "public read
-- of a restricted table". Only add columns here that are meant to be
-- public.
-- Two distinct rankings, not one list filtered two ways: national_rank is
-- a straight global ranking; regional_rank is computed *within* each
-- region (partition by region) so it's a real "rank among your region",
-- not just the national rank re-displayed on a filtered subset.
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
  ) as regional_rank
from public.profiles;

grant select on public.profiles_public to authenticated;
