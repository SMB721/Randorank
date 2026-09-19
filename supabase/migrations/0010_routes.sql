-- Generated routes (§5 of the cahier des charges): a blueprint produced by
-- the routing engine, distinct from a `hike` (an actual outing). Same
-- geometry-via-RPC pattern as create_hike, since PostGIS geometry can't be
-- inserted or read safely over the REST API.
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Tracé généré',
  track geometry(LineString, 4326) not null,
  distance_km numeric(10, 2) not null,
  elevation_gain_m numeric(10, 2) not null default 0,
  niveau text not null check (niveau in ('debutant', 'amateur', 'avance')),
  region text,
  created_at timestamptz not null default now()
);

alter table public.routes enable row level security;

create policy "Users can view their own routes"
  on public.routes for select
  using (auth.uid() = created_by);

create policy "Users can delete their own routes"
  on public.routes for delete
  using (auth.uid() = created_by);

create index routes_created_by_idx on public.routes (created_by);
create index routes_track_idx on public.routes using gist (track);

create or replace function public.create_route(
  p_name text,
  p_coordinates jsonb, -- array of [lon, lat]
  p_distance_km numeric,
  p_elevation_gain_m numeric,
  p_niveau text,
  p_region text
)
returns public.routes
language plpgsql
security definer set search_path = public
as $$
declare
  new_route public.routes;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.routes (
    created_by, name, track, distance_km, elevation_gain_m, niveau, region
  )
  values (
    auth.uid(), p_name,
    st_setsrid(st_geomfromgeojson(
      json_build_object('type', 'LineString', 'coordinates', p_coordinates)::text
    ), 4326),
    p_distance_km, p_elevation_gain_m, p_niveau, p_region
  )
  returning * into new_route;

  return new_route;
end;
$$;

grant execute on function public.create_route to authenticated;

create view public.routes_geojson
with (security_invoker = true) as
select
  id, created_by, name, distance_km, elevation_gain_m, niveau, region, created_at,
  st_asgeojson(track)::jsonb as track_geojson
from public.routes;

grant select on public.routes_geojson to authenticated;
