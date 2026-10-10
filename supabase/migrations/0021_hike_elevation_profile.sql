-- Per-hike altitude profile, for the Premium advanced stats.
--
-- Altitudes were read from GPX files / the live recorder but never kept.
-- `elevation_profile` stores them as a JSON array of metres, thinned to at
-- most ~300 evenly spaced samples (the client does the thinning). The i-th
-- sample sits at track index round(i * (n - 1) / (m - 1)), with n the track's
-- point count and m the array length, so no distances are stored twice.
-- Hikes created before this migration have NULL: the UI says so.

alter table public.hikes add column elevation_profile jsonb;

alter table public.hikes
  add constraint hikes_elevation_profile_chk check (
    elevation_profile is null
    or (
      jsonb_typeof(elevation_profile) = 'array'
      and jsonb_array_length(elevation_profile) between 2 and 2000
    )
  );

-- Same body as 0002 plus an optional p_elevations. A new overload would make
-- named-argument RPC calls ambiguous, so the old signature is dropped.
drop function public.create_hike(
  text, text, jsonb, numeric, numeric, integer, numeric, timestamptz, boolean, text
);

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
  p_validation_notes text,
  p_elevations jsonb default null -- array of metres, see above
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
    duration_seconds, avg_speed_kmh, started_at, is_valid, validation_notes,
    elevation_profile
  )
  values (
    auth.uid(), p_name, p_source,
    st_setsrid(st_geomfromgeojson(
      json_build_object('type', 'LineString', 'coordinates', p_coordinates)::text
    ), 4326),
    p_distance_km, p_elevation_gain_m, p_duration_seconds, p_avg_speed_kmh,
    p_started_at, p_is_valid, p_validation_notes,
    p_elevations
  )
  returning * into new_hike;

  return new_hike;
end;
$$;

grant execute on function public.create_hike to authenticated;

-- New column goes last: CREATE OR REPLACE VIEW can only append columns.
create or replace view public.hikes_geojson
with (security_invoker = true) as
select
  id, user_id, name, source, distance_km, elevation_gain_m,
  duration_seconds, avg_speed_kmh, started_at, is_valid, validation_notes,
  created_at,
  st_asgeojson(track)::jsonb as track_geojson,
  elevation_profile
from public.hikes;

grant select on public.hikes_geojson to authenticated;
