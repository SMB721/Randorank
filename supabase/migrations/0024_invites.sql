-- Invite links ("Défiez un ami") and the "Pionnier" badge.
--
-- invite_code   10 hex characters in each member's link: randorank.com/i/<code>
-- invited_by    who invited the member (set once)
-- member_number order of arrival (1 = first profile); drives the Pionnier
--               badge. New profiles take the next number from a sequence.
--
-- accept_invite() is the only way to use a code: it makes the inviter and the
-- invitee follow each other (so both appear in each other's friends
-- leaderboard) and records invited_by once. It runs with the owner's rights
-- because the follows policy only lets a member insert their own side.

alter table public.profiles
  add column invite_code text,
  add column invited_by uuid references auth.users (id) on delete set null,
  add column member_number integer;

update public.profiles
set invite_code = substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
where invite_code is null;

with ordered as (
  select id, row_number() over (order by created_at, id) as rn from public.profiles
)
update public.profiles p set member_number = o.rn from ordered o where p.id = o.id;

create sequence public.profile_member_seq;
select setval(
  'public.profile_member_seq',
  coalesce((select max(member_number) from public.profiles), 0) + 1,
  false
);

alter table public.profiles
  alter column invite_code set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  alter column invite_code set not null,
  alter column member_number set default nextval('public.profile_member_seq'),
  alter column member_number set not null;

create unique index profiles_invite_code_idx on public.profiles (invite_code);
create unique index profiles_member_number_idx on public.profiles (member_number);

create or replace function public.accept_invite(p_code text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_inviter uuid;
  v_name text;
begin
  if v_me is null then
    return null;
  end if;
  -- Guests have no identity yet: the code waits until they create an account.
  if exists (select 1 from auth.users u where u.id = v_me and u.is_anonymous) then
    return null;
  end if;

  select id, username into v_inviter, v_name
  from public.profiles where invite_code = lower(trim(p_code));
  if v_inviter is null or v_inviter = v_me then
    return null;
  end if;

  update public.profiles set invited_by = v_inviter where id = v_me and invited_by is null;
  if not found then
    return null; -- already invited by someone: first invitation wins
  end if;

  insert into public.follows (follower_id, followed_id)
  values (v_me, v_inviter), (v_inviter, v_me)
  on conflict do nothing;

  return coalesce(v_name, '');
end;
$$;

revoke all on function public.accept_invite(text) from public;
grant execute on function public.accept_invite(text) to authenticated;

-- Pionnier: one of the first 200 members. New metric for the badge system.
alter table public.badges drop constraint if exists badges_metric_check;
alter table public.badges add constraint badges_metric_check check (
  metric in ('hike_count', 'total_distance_km', 'total_elevation_m', 'user_level', 'member_number')
);

create or replace function public.award_badges()
returns trigger as $$
begin
  insert into public.user_badges (user_id, badge_id)
  select new.id, b.id
  from public.badges b
  where
    (b.metric = 'hike_count' and new.hike_count >= b.threshold)
    or (b.metric = 'total_distance_km' and new.total_distance_km >= b.threshold)
    or (b.metric = 'total_elevation_m' and new.total_elevation_m >= b.threshold)
    or (
      b.metric = 'user_level'
      and (case new.user_level
        when 'debutant' then 0
        when 'amateur' then 1
        when 'avance' then 2
      end) >= b.threshold
    )
    or (b.metric = 'member_number' and new.member_number <= b.threshold)
  on conflict (user_id, badge_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Also award at sign-up (the existing trigger only fires on stat updates).
drop trigger if exists on_profile_created_award_badges on public.profiles;
create trigger on_profile_created_award_badges
  after insert on public.profiles
  for each row execute function public.award_badges();

insert into public.badges (code, name, description, icon, metric, threshold) values
  ('pioneer', 'Pionnier', 'Parmi les 200 premiers membres de RandoRank. On s''en souviendra.', '🚩', 'member_number', 200)
on conflict (code) do nothing;

-- Existing members who qualify get it now.
insert into public.user_badges (user_id, badge_id)
select p.id, b.id
from public.profiles p
join public.badges b on b.code = 'pioneer'
where p.member_number <= b.threshold
on conflict (user_id, badge_id) do nothing;
