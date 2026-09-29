alter table public.profiles add column free_route_used boolean not null default false;

grant update (free_route_used) on public.profiles to authenticated;
