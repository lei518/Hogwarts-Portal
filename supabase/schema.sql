-- Hogwarts Portal: accounts + cloud saves
-- Run this once in the Supabase SQL editor (or via `supabase db push`) for a fresh project.
--
-- Players sign in with a username, not an email - the client synthesizes an
-- unreachable `username@hogwarts.local` address and drives Supabase Auth
-- with that under the hood (see src/utils/auth.ts). Because that address
-- can never receive mail, this project's Auth settings MUST have
-- "Confirm email" turned OFF (Authentication -> Providers -> Email in the
-- Supabase dashboard) - otherwise every signup is stuck waiting on a
-- confirmation link that can never arrive.

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  -- Backdated so the very first rename after signup is never blocked by the
  -- cooldown below (only a *second* rename within 15 days of the first is).
  last_name_change_at timestamptz not null default (now() - interval '15 days')
);

create table public.saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  game_state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.saves enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own save" on public.saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.enforce_name_change_cooldown()
returns trigger as $$
begin
  if NEW.display_name is distinct from OLD.display_name
     and now() - OLD.last_name_change_at < interval '15 days' then
    raise exception 'display_name_cooldown_active';
  end if;
  NEW.last_name_change_at := now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_name_cooldown
  before update on public.profiles
  for each row execute function public.enforce_name_change_cooldown();
