-- Weekly summary e-mail (opt-in, double opt-in).
--
-- weekly_summary              the member asked for the e-mail (default off)
-- weekly_summary_confirmed_at set when they clicked the link in the
--                             confirmation e-mail; nothing is sent before
--                             that, so nobody can sign someone else's
--                             address up (sign-up has no e-mail check)
-- email_locale                language of the e-mails (copied from the UI
--                             language when they opt in)
-- email_token                 secret in the confirm / unsubscribe links
-- last_weekly_summary_at      guards against sending twice in a week
--
-- No UPDATE grant is added for authenticated users: these columns are only
-- written by the server (service role), so a member cannot fake a
-- confirmation. The existing SELECT policy keeps each row private.

alter table public.profiles
  add column weekly_summary boolean not null default false,
  add column weekly_summary_confirmed_at timestamptz,
  add column email_locale text not null default 'fr'
    check (email_locale in ('fr', 'en', 'it', 'es', 'de')),
  add column email_token uuid not null default gen_random_uuid(),
  add column last_weekly_summary_at timestamptz;

create unique index profiles_email_token_idx on public.profiles (email_token);

create index profiles_weekly_summary_idx
  on public.profiles (last_weekly_summary_at nulls first)
  where weekly_summary and weekly_summary_confirmed_at is not null;
