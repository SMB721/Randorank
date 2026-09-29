-- Badges are awarded automatically server-side (via a trigger on profiles'
-- aggregate stats, the same source of truth as the leaderboard) so clients
-- can never grant themselves a badge they haven't earned.
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  metric text not null check (
    metric in ('hike_count', 'total_distance_km', 'total_elevation_m', 'user_level')
  ),
  threshold numeric not null,
  created_at timestamptz not null default now()
);

alter table public.badges enable row level security;

create policy "badges are publicly readable"
  on public.badges for select
  using (true);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

alter table public.user_badges enable row level security;

create policy "users can view their own badges"
  on public.user_badges for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy for authenticated: only the trigger below
-- (running as the table owner, which bypasses RLS) can write here.

create or replace function public.award_badges()
returns trigger as $$
begin
  insert into public.user_badges (user_id, badge_id)
  select new.id, b.id
  from public.badges b
  where
    (b.metric = 'hike_count' and new.hike_count >= b.threshold)
    or (b.metric = 'total_distance_km' and new.total_distance_km >= b.threshold)
    or (b.metric = 'total_elevation_m' and new.total_elevation_m >= b.threshold)
    or (
      b.metric = 'user_level'
      and (case new.user_level
        when 'debutant' then 0
        when 'amateur' then 1
        when 'avance' then 2
      end) >= b.threshold
    )
  on conflict (user_id, badge_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_profile_stats_updated_award_badges on public.profiles;
create trigger on_profile_stats_updated_award_badges
  after update of hike_count, total_distance_km, total_elevation_m, user_level
  on public.profiles
  for each row execute function public.award_badges();

insert into public.badges (code, name, description, icon, metric, threshold) values
  ('first_hike', 'Premier Pas', 'Votre toute première rando enregistrée. Le début d''une obsession.', '🥾', 'hike_count', 1),
  ('regular_10', 'Randonneur Régulier', '10 sorties au compteur. Vous commencez à connaître vos sentiers par cœur.', '🔁', 'hike_count', 10),
  ('unstoppable_30', 'Increvable', '30 randos. À ce stade, vos chaussures ont plus vécu que vous.', '🔥', 'hike_count', 30),
  ('distance_50', 'Les Mollets Chauffés', '50 km cumulés. Le corps commence à comprendre ce qu''on lui demande.', '🏃', 'total_distance_km', 50),
  ('distance_200', 'Marathonien des Sentiers', '200 km parcourus. Largement de quoi traverser un département à pied.', '🏅', 'total_distance_km', 200),
  ('distance_500', 'Traceur d''Horizon', '500 km cumulés. La carte commence à manquer de place pour vos traces.', '🧭', 'total_distance_km', 500),
  ('elevation_1000', 'Grimpeur du Dimanche', '1000 m de dénivelé cumulé. Le début de la fin pour vos mollets.', '⛰️', 'total_elevation_m', 1000),
  ('elevation_5000', 'Chasseur de Sommets', '5000 m de D+ cumulés. Presque l''Everest depuis le camp de base.', '🏔️', 'total_elevation_m', 5000),
  ('elevation_10000', 'Roi des Cimes', '10 000 m de D+ cumulés. On ne discute plus, on salue.', '👑', 'total_elevation_m', 10000),
  ('level_amateur', 'Passage Amateur', 'Vous avez quitté le rang des débutants. Retour en arrière impossible.', '🎖️', 'user_level', 1),
  ('level_avance', 'Élite du Sentier', 'Niveau avancé atteint. La référence de la communauté RandoRank.', '🥇', 'user_level', 2)
on conflict (code) do nothing;
