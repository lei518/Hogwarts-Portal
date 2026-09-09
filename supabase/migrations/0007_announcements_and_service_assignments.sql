-- Phase 6 - Communication & Administration System. Additive/alter migration
-- for an already-live database (see 0001-0006 for the same convention).

-- Announcements: expand the existing school-wide-only table (live since
-- 0004, but never actually written to - createAnnouncement had zero
-- callers) into a real authored/published/expiring broadcast system,
-- school-wide or course-scoped. The table is empty today, so these ALTERs
-- carry no data-migration risk.
alter table public.announcements rename column body to content;
alter table public.announcements rename column category to announcement_type;

alter table public.announcements drop constraint if exists announcements_category_check;
alter table public.announcements alter column announcement_type set default 'General';
alter table public.announcements add constraint announcements_announcement_type_check
  check (announcement_type in ('General', 'Academic', 'Campus Event', 'Emergency', 'Maintenance'));

alter table public.announcements add column visibility text not null default 'School'
  check (visibility in ('School', 'Course'));
alter table public.announcements add constraint announcements_visibility_course_check
  check ((visibility = 'Course' and course_id is not null) or (visibility = 'School' and course_id is null));

alter table public.announcements add column published boolean not null default false;
alter table public.announcements alter column published_at drop not null;
alter table public.announcements alter column published_at drop default;
alter table public.announcements add column expires_at timestamptz;
alter table public.announcements add column created_at timestamptz not null default now();

drop policy if exists "authenticated can view announcements" on public.announcements;
drop policy if exists "professors and admins author announcements" on public.announcements;
drop policy if exists "authors manage their own announcements" on public.announcements;
drop policy if exists "authors delete their own announcements" on public.announcements;

-- Author sees their own (any status, e.g. drafts); admin sees everything;
-- everyone else sees a row only once it's actually published, not expired,
-- and either School-wide or a Course announcement for a course they're
-- enrolled in / teach.
create policy "view visible announcements" on public.announcements
  for select using (
    author_user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
    or (
      published = true
      and (expires_at is null or expires_at > now())
      and (
        visibility = 'School'
        or exists (select 1 from public.course_enrollments e where e.course_id = course_id and e.student_user_id = auth.uid())
        or exists (select 1 from public.course_professor_assignments a where a.course_id = course_id and a.professor_user_id = auth.uid())
      )
    )
  );

-- Admin can author anything; a professor can only ever insert a
-- Course-visibility row for a course they're the assigned professor of -
-- never School-wide.
create policy "admins and professors author announcements" on public.announcements
  for insert with check (
    author_user_id = auth.uid()
    and (
      exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
      or (
        visibility = 'Course'
        and exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'professor' and p.active)
        and exists (select 1 from public.course_professor_assignments a where a.course_id = course_id and a.professor_user_id = auth.uid())
      )
    )
  );

-- Same shape on update's WITH CHECK, closing a gap the original policy
-- didn't have: without it, a professor could edit their own Course
-- announcement into a fake School-wide broadcast after creation.
create policy "authors update their own announcements" on public.announcements
  for update using (
    author_user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  ) with check (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
    or (
      author_user_id = auth.uid()
      and visibility = 'Course'
      and exists (select 1 from public.course_professor_assignments a where a.course_id = course_id and a.professor_user_id = auth.uid())
    )
  );

create policy "authors delete their own announcements" on public.announcements
  for delete using (
    author_user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

-- Service Administration: configurable staff assignment per campus
-- service, replacing hardcoded flavor-text staff (e.g. the old
-- "Madam Pomfrey" object in data/hospitalWing.ts). `unique` on
-- service_name makes assigning a plain upsert - one current assignee per
-- service. `staff_user_id` stays nullable so a fresh deployment starts
-- honestly unassigned, never a fabricated default.
create table public.service_assignments (
  id uuid primary key default gen_random_uuid(),
  service_name text not null unique
    check (service_name in ('Library', 'Hospital Wing', 'Lost & Found', 'Hogsmeade Permits', 'Owlery Administration')),
  staff_user_id uuid references public.profiles(user_id),
  assigned_at timestamptz not null default now()
);

alter table public.service_assignments enable row level security;

create policy "authenticated can view service assignments" on public.service_assignments
  for select using (auth.role() = 'authenticated');

create policy "admins manage service assignments" on public.service_assignments
  for all using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  ) with check (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

insert into public.service_assignments (service_name) values
  ('Library'), ('Hospital Wing'), ('Lost & Found'), ('Hogsmeade Permits'), ('Owlery Administration');
