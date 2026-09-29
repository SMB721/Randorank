-- Profile picture storage. profiles.avatar_url already exists (0001) but was
-- never wired up to anything. Unlike hike photos, an avatar is meant to be
-- shown publicly (classement, profil) so the bucket is public — no signed
-- URLs needed to render it.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Objects are stored as "{user_id}/avatar.jpg" (upsert on re-upload) — these
-- policies only let a user write inside their own folder; anyone can read
-- since the bucket itself is public.
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
