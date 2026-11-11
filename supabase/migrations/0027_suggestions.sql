-- "Sac à idées": suggestions, problems and kind words sent by members from
-- the home screen. Members can add rows and read their own; everything else
-- (reading them all) goes through the service role / SQL editor.
--
-- user_id is set to null when the account is deleted: the message stays as
-- an anonymous note, with no link back to a person.

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('idea', 'problem', 'love')),
  message text not null check (char_length(message) between 3 and 1000),
  locale text,
  created_at timestamptz not null default now()
);

create index suggestions_created_idx
  on public.suggestions (created_at desc);
create index suggestions_user_created_idx
  on public.suggestions (user_id, created_at desc);

alter table public.suggestions enable row level security;

create policy "Users can send their own suggestions"
  on public.suggestions for insert
  with check (auth.uid() = user_id);

-- Needed for the daily limit check in the server action.
create policy "Users can read their own suggestions"
  on public.suggestions for select
  using (auth.uid() = user_id);
