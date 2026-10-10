-- Freemium + anonymous accounts.
--
-- 1. route_generations: one row per route the generator produced, so the
--    free tier's monthly quota can be enforced server-side (Premium is
--    unlimited and simply never reads it).
-- 2. The public leaderboard and the challenge ranking now skip anonymous
--    users (auth.users.is_anonymous). An anonymous account has no verified
--    identity, so letting it rank would make fake profiles and cheating
--    trivial. The rows come back automatically once the user links an
--    email / Google account (Supabase flips is_anonymous to false).
--
-- Prerequisite (dashboard, not SQL): Authentication > Sign In / Providers >
-- "Allow anonymous sign-ins" must be ON, and "Manual linking" must be ON for
-- the Google upgrade path (supabase.auth.linkIdentity).

create table public.route_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index route_generations_user_created_idx
  on public.route_generations (user_id, created_at desc);

alter table public.route_generations enable row level security;

create policy "Users can read their own route generations"
  on public.route_generations for select
  using (auth.uid() = user_id);

create policy "Users can log their own route generations"
  on public.route_generations for insert
  with check (auth.uid() = user_id);

-- Same columns as 0004, same ranking rules; only the FROM is filtered.
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
from public.profiles p
where not exists (
  select 1 from auth.users u where u.id = p.id and u.is_anonymous
);

grant select on public.profiles_public to authenticated;

-- Same definition as 0008, with the same anonymous filter on participants.
create or replace view public.challenge_progress
as
select
  c.id as challenge_id,
  p.id as user_id,
  p.username,
  p.region,
  agg.progress,
  row_number() over (
    partition by c.id
    order by agg.progress desc
  ) as rank
from public.challenges c
cross join public.profiles p
cross join lateral (
  select
    case c.metric
      when 'hike_count' then count(h.id)
      when 'distance_km_sum' then coalesce(sum(h.distance_km), 0)
      when 'elevation_gain_m_sum' then coalesce(sum(h.elevation_gain_m), 0)
      when 'elevation_gain_m_max' then coalesce(max(h.elevation_gain_m), 0)
    end as progress
  from public.hikes h
  where
    h.user_id = p.id
    and h.is_valid = true
    and h.started_at::date between c.period_start and c.period_end
) agg
where agg.progress > 0
  and not exists (
    select 1 from auth.users u where u.id = p.id and u.is_anonymous
  );

grant select on public.challenge_progress to authenticated;
