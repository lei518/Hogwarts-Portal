-- Hogwarts Portal: Authentication Foundation (Phase 6A)
-- Additive migration - adds role-based access control and account
-- activation to the existing public.profiles table.
--
-- Safe to run against a database that already has real user data:
--   - No table is dropped or recreated.
--   - No existing row is deleted or requires any action from its owner.
--   - Both new columns are NOT NULL WITH a DEFAULT, so Postgres backfills
--     every existing row automatically ('student' / true) in the same
--     statement that adds the column.
--
-- Run this once in the Supabase SQL editor, or via `supabase db push`.

alter table public.profiles
  add column if not exists role text not null default 'student';

alter table public.profiles
  add column if not exists active boolean not null default true;

-- Constrain role to the three known values. Added as a separate statement
-- (not inline on the column) so this migration is safe to re-run: adding
-- the same named constraint twice is the one part of this file that is
-- NOT automatically idempotent, so guard it explicitly.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('student', 'professor', 'admin'));
  end if;
end $$;

-- Security hardening: the existing "own profile" RLS policy (see
-- supabase/schema.sql) is `for all using (auth.uid() = user_id)` - it
-- authorizes a user to update their OWN row, but does not distinguish
-- which COLUMNS they may change. Without this trigger, any authenticated
-- user could call `supabase.from('profiles').update({ role: 'admin' })`
-- against their own row and self-promote, since RLS alone only checks row
-- ownership, not column-level intent. This trigger silently reverts
-- role/active to their prior values unless the request is made with the
-- service role key (i.e. from a trusted server context, not the browser
-- client this app uses) - the same "reject, don't error" shape as
-- nothing here breaking a legitimate display_name-only update.
create or replace function public.prevent_profile_role_self_escalation()
returns trigger as $$
begin
  if (NEW.role is distinct from OLD.role or NEW.active is distinct from OLD.active)
     and coalesce(auth.role(), '') <> 'service_role' then
    NEW.role := OLD.role;
    NEW.active := OLD.active;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_role_self_escalation on public.profiles;
create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_role_self_escalation();

-- Until Phase 6B's User Administration exists, changing a real user's role
-- or active flag is a manual operation: run
--   update public.profiles set role = 'professor' where user_id = '<uuid>';
-- from the Supabase SQL editor (which runs as the database owner, not
-- through the anon/authenticated client roles the trigger above guards
-- against) or via the dashboard's table editor.
