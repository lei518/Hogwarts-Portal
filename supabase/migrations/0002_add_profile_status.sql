-- Hogwarts Portal: Account Status (Phase 6E)
-- Additive migration - adds a richer, admin-facing status to the existing
-- public.profiles table. Reuses that table exactly as
-- 0001_add_profile_role_and_active.sql did for role/active; no new table,
-- no information duplicated (see below for how `status` and `active`
-- relate).
--
-- Safe to run against a database that already has real user data: no table
-- is dropped or recreated, no existing row is deleted, and the new column
-- is NOT NULL WITH a DEFAULT so Postgres backfills every existing row
-- ('Active') in the same statement that adds it.
--
-- Run this once in the Supabase SQL editor, or via `supabase db push`.

alter table public.profiles
  add column if not exists status text not null default 'Active';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_status_check check (status in ('Active', 'Disabled', 'Locked'));
  end if;
end $$;

-- `active` (Phase 6A) stays the one boolean RoleGate reads to decide
-- whether a signed-in user gets signed back out - untouched, and nothing
-- in src/auth/RoleGate.tsx or AuthContext.tsx changes. `status` is the
-- richer, admin-facing value User Administration edits. Rather than have
-- two independently-writable columns that could drift apart (real
-- duplication), `active` becomes fully derived from `status` inside the
-- trigger below: any writer - the Edge Function included - only ever needs
-- to set `status`, and `active` is recomputed to match every time. Both
-- "Disabled" and "Locked" resolve to active = false, which is exactly what
-- already makes RoleGate sign the user out and redirect to
-- /account-inactive - no new gate, no new redirect, the existing Phase 6A
-- mechanism just now has a real writer behind it.
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

  -- Always recompute from `status`, even for a service_role write that
  -- only set `status` and left `active` as whatever it was before - this
  -- is what makes `active` a true derived column instead of a second
  -- fact an Edge Function has to remember to keep in sync by convention.
  NEW.active := (NEW.status = 'Active');

  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger itself is unchanged (same name, same timing) - only the function
-- body above changed, so this statement is here purely so the migration
-- is self-contained and re-runnable; it re-points the existing trigger at
-- the just-replaced function.
drop trigger if exists trg_prevent_role_self_escalation on public.profiles;
create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_role_self_escalation();
