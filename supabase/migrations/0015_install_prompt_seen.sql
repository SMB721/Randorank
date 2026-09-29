alter table public.profiles add column install_prompt_seen boolean not null default false;

-- Backfill only: everyone who already has an account has already lived
-- through the app without this screen — don't force it on them retroactively.
-- New signups get the column's own default (false) and see it once.
update public.profiles set install_prompt_seen = true;

grant update (install_prompt_seen) on public.profiles to authenticated;
