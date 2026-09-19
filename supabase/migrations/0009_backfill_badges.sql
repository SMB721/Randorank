-- One-off (and re-runnable) backfill: awards badges to users who already
-- qualified before the trigger existed. Safe to run again after adding
-- new badges later — on conflict just skips what's already earned.
insert into public.user_badges (user_id, badge_id)
select p.id, b.id
from public.profiles p
join public.badges b on
  (b.metric = 'hike_count' and p.hike_count >= b.threshold)
  or (b.metric = 'total_distance_km' and p.total_distance_km >= b.threshold)
  or (b.metric = 'total_elevation_m' and p.total_elevation_m >= b.threshold)
  or (
    b.metric = 'user_level'
    and (case p.user_level
      when 'debutant' then 0
      when 'amateur' then 1
      when 'avance' then 2
    end) >= b.threshold
  )
on conflict (user_id, badge_id) do nothing;
