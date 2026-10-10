-- Cancellation survey: one optional answer per cancellation attempt, so we
-- learn why people leave.
--
-- user_id is nullable and set to null when the account is deleted: the
-- answer is kept as an anonymous statistic (no free-text link to a person
-- once the account is gone). Rows are write-only for users; only the
-- service role (dashboard / SQL) reads them.

create table public.cancellation_surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  reason text not null check (
    reason in (
      'too_expensive',
      'not_using',
      'missing_features',
      'found_alternative',
      'technical_issues',
      'seasonal',
      'other'
    )
  ),
  comment text check (comment is null or char_length(comment) <= 1000),
  subscription_status text,
  created_at timestamptz not null default now()
);

create index cancellation_surveys_created_idx
  on public.cancellation_surveys (created_at desc);

alter table public.cancellation_surveys enable row level security;

create policy "Users can submit their own cancellation survey"
  on public.cancellation_surveys for insert
  with check (auth.uid() = user_id);
