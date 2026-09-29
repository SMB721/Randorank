alter table public.profiles add column blur_endpoints boolean not null default false;

grant update (blur_endpoints) on public.profiles to authenticated;
