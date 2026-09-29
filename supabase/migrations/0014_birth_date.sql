-- Optional birth date (not a raw "age" field, which would go stale) — lets
-- us compute current age and detect the user's birthday precisely. Never
-- exposed via profiles_public: this stays private, unlike username/region.
alter table public.profiles
  add column birth_date date;

alter table public.profiles
  add constraint profiles_birth_date_plausible check (
    birth_date is null
    or (
      birth_date <= current_date - interval '5 years'
      and birth_date >= current_date - interval '120 years'
    )
  );

-- Extends the existing column-level grant (username, avatar_url, region)
-- from 0002_hikes.sql — this only adds birth_date, it doesn't replace it.
grant update (birth_date) on public.profiles to authenticated;
