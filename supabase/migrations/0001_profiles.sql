-- Profile table: 1:1 extension of auth.users with the app-specific fields
-- described in the spec (region, level, aggregated stats, subscription state).
-- Aggregated stats (total_distance_km, total_elevation_m, hike_count) are
-- recalculated whenever a hike is added, never computed on the fly, so
-- leaderboard reads stay fast.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  avatar_url text,
  region text,
  user_level text not null default 'debutant'
    check (user_level in ('debutant', 'amateur', 'avance')),
  total_distance_km numeric(10, 2) not null default 0,
  total_elevation_m numeric(10, 2) not null default 0,
  hike_count integer not null default 0,
  subscription_tier text not null default 'freemium'
    check (subscription_tier in ('freemium', 'premium', 'vip')),
  subscription_status text not null default 'none',
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- V1: a user can only read/edit their own profile. The public leaderboard
-- will need its own policy (or a dedicated view exposing only safe columns)
-- once the classement feature is built — do not open this up before then.
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up (email or Google).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at current on every edit.
create function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
