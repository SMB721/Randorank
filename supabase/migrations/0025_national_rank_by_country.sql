-- national_rank becomes "rank among the hikers of your country" (it used to
-- rank every account together, which only made sense while everyone was
-- French). regional_rank is kept as is so the view keeps its columns, but
-- the app no longer reads it: the region is not collected any more (0024).
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
where not exists (
  select 1 from auth.users u where u.id = p.id and u.is_anonymous
);

grant select on public.profiles_public to authenticated;
