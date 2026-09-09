-- Hogwarts Portal: Year-Based Onboarding (Phase 6L)
-- Additive migration - adds Admin-assigned academic year and house to the
-- existing public.profiles table, the same pattern as
-- 0001_add_profile_role_and_active.sql / 0002_add_profile_status.sql. No
-- new table, no information duplicated.
--
-- `year` (1-7) drives onboarding routing client-side (Year 1 -> Wand +
-- Sorting Hat, Year 5 -> Patronus Charm, everyone else -> straight to the
-- Dashboard) and seeds a synthesized Character's own `year` field on first
-- login - there is no more Character Creation page. `house` is only ever
-- set by an admin for an already-enrolled (Year 2-7) student; a Year 1
-- student's house still comes from the existing Sorting Hat ceremony, not
-- this column - the admin-create-account Edge Function rejects `house` for
-- Year 1 for exactly this reason.
--
-- Both columns are nullable: `year`/`house` are null for professor/admin
-- accounts (never applicable), and null for a self-service signup via
-- /create-account (that path is unchanged - it simply never gets an
-- admin-assigned year, so the client defaults such an account to a Year 1
-- experience).
--
-- Safe to run against a database that already has real user data: no table
-- is dropped or recreated, no existing row is deleted, and both new
-- columns are nullable with no default required.

alter table public.profiles
  add column if not exists year integer,
  add column if not exists house text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_year_check'
  ) then
    alter table public.profiles
      add constraint profiles_year_check check (year is null or year between 1 and 7);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_house_check'
  ) then
    alter table public.profiles
      add constraint profiles_house_check
        check (house is null or house in ('Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'));
  end if;
end $$;

-- `year`/`house` are admin-assigned facts about a student, not something a
-- signed-in user should be able to self-edit via a direct client update
-- (RLS's "own profile" policy in schema.sql would otherwise allow exactly
-- that). Extend the existing self-escalation trigger - already reverting
-- non-service_role changes to role/status/active - to guard these two
-- columns the same way.
create or replace function public.prevent_profile_role_self_escalation()
returns trigger as $$
begin
  if (NEW.role is distinct from OLD.role
      or NEW.status is distinct from OLD.status
      or NEW.active is distinct from OLD.active
      or NEW.year is distinct from OLD.year
      or NEW.house is distinct from OLD.house)
     and coalesce(auth.role(), '') <> 'service_role' then
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.active := OLD.active;
    NEW.year := OLD.year;
    NEW.house := OLD.house;
  end if;

  NEW.active := (NEW.status = 'Active');

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_role_self_escalation on public.profiles;
create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_role_self_escalation();
