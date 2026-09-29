-- "Classement entre amis" needs a follow graph. One-directional (à la
-- Strava): your friends leaderboard is you + everyone you follow, no
-- mutual acceptance required — keeps the feature light, per the cahier
-- des charges' "hors périmètre sauf demande explicite" note on social
-- features.
create table public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  followed_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

alter table public.follows enable row level security;

create policy "Users can view their own follows"
  on public.follows for select
  using (auth.uid() = follower_id);

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

create index follows_follower_id_idx on public.follows (follower_id);
