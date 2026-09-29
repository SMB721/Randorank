-- Public, anonymous-readable aggregates for the landing page's stats
-- section (animated counter + growth chart). No per-user data exposed —
-- only sums/counts across all valid hikes, safe for anon visitors.
create or replace view public.community_stats
as
select
  coalesce(sum(distance_km), 0) as total_km,
  coalesce(sum(elevation_gain_m), 0) as total_elevation_m,
  count(*) as total_hikes,
  count(distinct user_id) as total_hikers
from public.hikes
where is_valid = true;

grant select on public.community_stats to anon, authenticated;

-- Weekly community distance, for the animated growth chart. Only the last
-- 12 weeks matter for a landing-page sparkline; the app can widen this
-- later if needed.
create or replace view public.community_weekly_km
as
select
  date_trunc('week', started_at)::date as week_start,
  coalesce(sum(distance_km), 0) as km
from public.hikes
where is_valid = true and started_at is not null
group by 1
order by 1;

grant select on public.community_weekly_km to anon, authenticated;
