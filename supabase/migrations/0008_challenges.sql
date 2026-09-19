-- Challenges are time-boxed (period_start/period_end); progress is computed
-- live from valid hikes in that window via a view, the same pattern as
-- profiles_public — no per-hike trigger needed since each challenge only
-- reads hikes, never writes.
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  description text not null,
  icon text not null,
  metric text not null check (
    metric in ('hike_count', 'distance_km_sum', 'elevation_gain_m_sum', 'elevation_gain_m_max')
  ),
  threshold numeric not null,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  unique (code, period_start)
);

alter table public.challenges enable row level security;

create policy "challenges are publicly readable"
  on public.challenges for select
  using (true);

-- security definer-by-default (no security_invoker) so it can read every
-- participant's hikes for the leaderboard, same trade-off as profiles_public.
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
where agg.progress > 0;

grant select on public.challenge_progress to authenticated;

insert into public.challenges (code, name, description, icon, metric, threshold, period_start, period_end) values
  (
    'monthly_elevation',
    'Le Mois Qui Grimpe',
    'Cumule 1000 m de dénivelé positif ce mois-ci.',
    '⛰️',
    'elevation_gain_m_sum',
    1000,
    date_trunc('month', current_date)::date,
    (date_trunc('month', current_date) + interval '1 month - 1 day')::date
  ),
  (
    'monthly_frequency',
    'Randonneur Assidu',
    '5 sorties enregistrées ce mois-ci, pas une de moins.',
    '🔁',
    'hike_count',
    5,
    date_trunc('month', current_date)::date,
    (date_trunc('month', current_date) + interval '1 month - 1 day')::date
  ),
  (
    'monthly_distance',
    'Distance XXL',
    'Cumule 100 km ce mois-ci.',
    '🧭',
    'distance_km_sum',
    100,
    date_trunc('month', current_date)::date,
    (date_trunc('month', current_date) + interval '1 month - 1 day')::date
  ),
  (
    'monthly_biggest_hike',
    'La Grosse Sortie',
    'Le plus gros dénivelé sur une seule rando ce mois-ci.',
    '🏔️',
    'elevation_gain_m_max',
    300,
    date_trunc('month', current_date)::date,
    (date_trunc('month', current_date) + interval '1 month - 1 day')::date
  )
on conflict (code, period_start) do nothing;
