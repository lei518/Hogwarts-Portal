-- Phase 7A - Live Academic Data. Additive migration for an already-live
-- database (see 0001-0003 for the same convention). Adds the three tables
-- the academic side of the portal (Directory, Courses, Assignments,
-- Announcements) needs, plus one new RLS policy on profiles so a
-- Student/Professor Directory can read real accounts without a privileged
-- Edge Function - courses/assignments/announcements aren't as sensitive as
-- account identity, so plain RLS-governed client reads/writes are enough
-- (no service_role needed anywhere in this file).

-- Course -> Professor assignment. The seeded course catalog (data/courses.ts)
-- stays exactly as it is; this table is the only thing that resolves who
-- teaches a course, and it starts empty - every course begins "To Be
-- Assigned" until an admin assigns someone.
create table public.course_professor_assignments (
  course_id text primary key,
  professor_user_id uuid references public.profiles(user_id) on delete set null,
  assigned_at timestamptz not null default now()
);

alter table public.course_professor_assignments enable row level security;

create policy "authenticated can view course assignments" on public.course_professor_assignments
  for select using (auth.role() = 'authenticated');

create policy "admins manage course assignments" on public.course_professor_assignments
  for all using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  ) with check (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

-- Professor-authored academic work: assignments, quizzes, exams. Single
-- table read by both the Student Portal (Published only) and the Professor
-- Portal (their own, any status) - see CLAUDE.md's Assignments section for
-- the shared-model precedent this follows.
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  professor_user_id uuid references public.profiles(user_id),
  title text not null,
  description text not null default '',
  due_date date not null,
  item_type text not null default 'Assignment' check (item_type in ('Assignment', 'Quiz', 'Exam')),
  status text not null default 'Draft' check (status in ('Draft', 'Published', 'Archived')),
  house_points_reward integer,
  max_grade integer,
  created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;

create policy "read published or own assignments" on public.assignments
  for select using (
    status = 'Published'
    or professor_user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

create policy "professors and admins author assignments" on public.assignments
  for insert with check (
    professor_user_id = auth.uid()
    and (
      exists (
        select 1 from public.course_professor_assignments ca
        where ca.course_id = assignments.course_id and ca.professor_user_id = auth.uid()
      )
      or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
    )
  );

create policy "authors manage their own assignments" on public.assignments
  for update using (
    professor_user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

create policy "authors delete their own assignments" on public.assignments
  for delete using (
    professor_user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

-- School announcements (Global/Academic/House), authored by an admin or a
-- professor. Replaces the seeded data/announcements.ts and
-- data/professorPortal.ts's seeded professorAnnouncements - one table, both
-- consumers.
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null default 'Global' check (category in ('Global', 'Academic', 'House')),
  course_id text,
  author_user_id uuid references public.profiles(user_id),
  published_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "authenticated can view announcements" on public.announcements
  for select using (auth.role() = 'authenticated');

create policy "professors and admins author announcements" on public.announcements
  for insert with check (
    author_user_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role in ('professor', 'admin') and p.active
    )
  );

create policy "authors manage their own announcements" on public.announcements
  for update using (
    author_user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

create policy "authors delete their own announcements" on public.announcements
  for delete using (
    author_user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

-- Public Directory read. Additive alongside the existing "own profile"
-- policy (Postgres OR-combines multiple permissive policies for the same
-- command) - this is the only change needed for a Student/Professor
-- Directory to read real accounts, since profiles carries no more sensitive
-- data than display_name/role/year/house/status (email stays in auth.users,
-- never exposed here). Writes are untouched - still only the caller's own
-- row, or a service_role Edge Function.
create policy "authenticated can view active profiles" on public.profiles
  for select using (auth.role() = 'authenticated' and active = true);
