-- Photos attached to a hike (§4: photo — rattachée à une hike, avec point
-- géographique et URL de stockage). The files themselves live in Supabase
-- Storage; this table indexes them and carries the EXIF-derived
-- geolocation/date read at upload time.

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  hike_id uuid not null references public.hikes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  lat numeric,
  lon numeric,
  taken_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

create policy "Users can view their own photos"
  on public.photos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own photos"
  on public.photos for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own photos"
  on public.photos for delete
  using (auth.uid() = user_id);

create index photos_hike_id_idx on public.photos (hike_id);

-- Private bucket: hike photos can reveal home/location, so nothing here is
-- public by default (§8 RGPD) — access goes through signed URLs generated
-- server-side for the owner only.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

-- Objects are stored as "{user_id}/{hike_id}/{filename}" — these policies
-- only let a user read/write inside their own folder.
create policy "Users can upload into their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own photos"
  on storage.objects for select
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
