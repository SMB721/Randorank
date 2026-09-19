-- Hike tracking: PostGIS-backed tracks, aggregated stats recalculated on
-- every insert/update/delete (never computed at read time — keeps the
-- future leaderboard fast), and the anti-cheat coherence checks required
-- from this step onward (§8: implausible speed, non-monotonic time,
-- teleportation).

create extension if not exists postgis;
create extension if not exists pgcrypto;

create table public.hikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Randonnée',
  source text not null default 'gpx_import'
    check (source in ('gpx_import', 'live_recording', 'generated')),
  track geometry(LineString, 4326) not null,
  distance_km numeric(10, 2) not null,
  elevation_gain_m numeric(10, 2) not null default 0,
  duration_seconds integer not null default 0,
  avg_speed_kmh numeric(10, 2) not null default 0,
  started_at timestamptz,
  -- Hikes that fail the coherence checks are kept (nothing is silently
  -- discarded) but excluded from aggregated stats and, later, from the
  -- leaderboard.
  is_valid boolean not null default true,
  validation_notes text,
  created_at timestamptz not null default now()
);

alter table public.hikes enable row level security;

create policy "Users can view their own hikes"
  on public.hikes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own hikes"
  on public.hikes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own hikes"
  on public.hikes for delete
  using (auth.uid() = user_id);

create index hikes_user_id_idx on public.hikes (user_id);
create index hikes_track_idx on public.hikes using gist (track);

-- Geometry can't be inserted safely through the REST API as WKT (no cast
-- from text to geometry), so hikes are created through this RPC: it takes
-- plain coordinates, builds the PostGIS geometry server-side, and forces
-- user_id to auth.uid() rather than trusting client input.
create or replace function public.create_hike(
  p_name text,
  p_source text,
  p_coordinates jsonb, -- array of [lon, lat]
  p_distance_km numeric,
  p_elevation_gain_m numeric,
  p_duration_seconds integer,
  p_avg_speed_kmh numeric,
  p_started_at timestamptz,
  p_is_valid boolean,
  p_validation_notes text
)
returns public.hikes
language plpgsql
security definer set search_path = public
as $$
declare
  new_hike public.hikes;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.hikes (
    user_id, name, source, track, distance_km, elevation_gain_m,
    duration_seconds, avg_speed_kmh, started_at, is_valid, validation_notes
  )
  values (
    auth.uid(), p_name, p_source,
    st_setsrid(st_geomfromgeojson(
      json_build_object('type', 'LineString', 'coordinates', p_coordinates)::text
    ), 4326),
    p_distance_km, p_elevation_gain_m, p_duration_seconds, p_avg_speed_kmh,
    p_started_at, p_is_valid, p_validation_notes
  )
  returning * into new_hike;

  return new_hike;
end;
$$;

grant execute on function public.create_hike to authenticated;

-- Recalculate the owner's aggregated stats (and level) whenever their
-- hikes change. Only valid hikes count.
create or replace function public.recalculate_profile_stats()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  affected_user uuid;
  stats record;
begin
  affected_user := coalesce(new.user_id, old.user_id);

  select
    coalesce(sum(distance_km), 0) as total_distance,
    coalesce(sum(elevation_gain_m), 0) as total_elevation,
    count(*) as total_hikes
  into stats
  from public.hikes
  where user_id = affected_user and is_valid;

  update public.profiles
  set
    total_distance_km = stats.total_distance,
    total_elevation_m = stats.total_elevation,
    hike_count = stats.total_hikes,
    user_level = case
      when stats.total_distance >= 200 then 'avance'
      when stats.total_distance >= 50 then 'amateur'
      else 'debutant'
    end
  where id = affected_user;

  return coalesce(new, old);
end;
$$;

create trigger on_hike_change
  after insert or update or delete on public.hikes
  for each row execute function public.recalculate_profile_stats();

-- PostGIS geometry can't be read back safely over the REST API either —
-- expose it as GeoJSON instead. security_invoker keeps the underlying
-- table's RLS in force (the view itself grants nothing extra).
create view public.hikes_geojson
with (security_invoker = true) as
select
  id, user_id, name, source, distance_km, elevation_gain_m,
  duration_seconds, avg_speed_kmh, started_at, is_valid, validation_notes,
  created_at,
  st_asgeojson(track)::jsonb as track_geojson
from public.hikes;

grant select on public.hikes_geojson to authenticated;

-- Security hardening: the "own profile" RLS policy lets a user UPDATE
-- their row, but RLS alone can't restrict *which* columns — without this,
-- a user could PATCH their own stats, level or subscription tier directly
-- through the REST API. Column-level grants close that gap; only the
-- trigger above (security definer, bypasses grants) can touch the rest.
revoke update on public.profiles from authenticated;
grant update (username, avatar_url, region) on public.profiles to authenticated;
