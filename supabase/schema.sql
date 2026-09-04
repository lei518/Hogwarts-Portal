-- Hogwarts Portal: accounts + cloud saves
-- Run this once in the Supabase SQL editor (or via `supabase db push`) for a fresh project.
--
-- Players sign in with their real email address (Phase 6H) - Supabase Auth
-- runs directly on it, with no synthetic address layer in between. Whether
-- "Confirm email" (Authentication -> Providers -> Email in the Supabase
-- dashboard) is required is now a normal project choice rather than a
-- hard requirement, since a real address can actually receive a
-- confirmation link.

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  -- Backdated so the very first rename after signup is never blocked by the
  -- cooldown below (only a *second* rename within 15 days of the first is).
  last_name_change_at timestamptz not null default (now() - interval '15 days'),
  -- Authentication Foundation (Phase 6A) - see
  -- supabase/migrations/0001_add_profile_role_and_active.sql for the
  -- additive version of these same two columns, for an already-live
  -- database. Every new signup is a student by default; becoming a
  -- professor or admin is a manual operation until Phase 6B's User
  -- Administration exists.
  role text not null default 'student' check (role in ('student', 'professor', 'admin')),
  active boolean not null default true,
  -- Account Status (Phase 6E) - see
  -- supabase/migrations/0002_add_profile_status.sql for the additive
  -- version of this column, for an already-live database. `active` above
  -- is fully derived from this column by the trigger below; User
  -- Administration edits `status`, never `active` directly.
  status text not null default 'Active' check (status in ('Active', 'Disabled', 'Locked'))
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

-- Authentication Foundation (Phase 6A) - prevents a user from promoting
-- themselves by updating their own row's role/active columns directly;
-- see the migration file's own comment for the full rationale.
create or replace function public.prevent_profile_role_self_escalation()
returns trigger as $$
begin
  if (NEW.role is distinct from OLD.role
      or NEW.status is distinct from OLD.status
      or NEW.active is distinct from OLD.active)
     and coalesce(auth.role(), '') <> 'service_role' then
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.active := OLD.active;
  end if;

  -- `active` is always derived from `status`, never set independently -
  -- see migrations/0002_add_profile_status.sql's own comment.
  NEW.active := (NEW.status = 'Active');

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_role_self_escalation();
