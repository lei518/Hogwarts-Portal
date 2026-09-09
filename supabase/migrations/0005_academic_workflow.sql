-- Phase 2 - Real Academic Workflow. Additive migration for an already-live
-- database (see 0001-0004 for the same convention).
--
-- Enrollment becomes a real, queryable fact instead of an implicit
-- "your year happens to match" client-side check - a student's own account
-- upserts its own enrollment rows (RLS-enforced, nobody can enroll anyone
-- else), which is what lets `assignments` actually enforce "students only
-- see assignments from courses they're enrolled in" server-side rather
-- than trusting the client.
create table public.course_enrollments (
  student_user_id uuid not null references public.profiles(user_id) on delete cascade,
  course_id text not null,
  enrolled_at timestamptz not null default now(),
  primary key (student_user_id, course_id)
);

alter table public.course_enrollments enable row level security;

create policy "students manage their own enrollment" on public.course_enrollments
  for all using (student_user_id = auth.uid()) with check (student_user_id = auth.uid());

create policy "professors and admins view course rosters" on public.course_enrollments
  for select using (
    exists (
      select 1 from public.course_professor_assignments ca
      where ca.course_id = course_enrollments.course_id and ca.professor_user_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

-- One row per (assignment, student). "Not Submitted" is the absence of a
-- row here - never a fabricated placeholder, matching the "Incomplete"
-- convention data/grades.ts already used. `status` starts 'Submitted' or
-- 'Late' (client sets it by comparing against the assignment's due_date at
-- submit time) and becomes 'Graded' once a professor grades it - at which
-- point the student can no longer edit it (see the update policy below).
create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_user_id uuid not null references public.profiles(user_id) on delete cascade,
  submission_text text not null,
  submitted_at timestamptz not null default now(),
  status text not null default 'Submitted' check (status in ('Submitted', 'Late', 'Graded')),
  score numeric,
  max_score numeric,
  feedback text,
  graded_by uuid references public.profiles(user_id),
  graded_at timestamptz,
  unique (assignment_id, student_user_id)
);

alter table public.assignment_submissions enable row level security;

create policy "students submit their own work" on public.assignment_submissions
  for insert with check (
    student_user_id = auth.uid()
    and exists (
      select 1 from public.assignments a
      join public.course_enrollments ce on ce.course_id = a.course_id and ce.student_user_id = auth.uid()
      where a.id = assignment_submissions.assignment_id and a.status = 'Published'
    )
  );

create policy "students view their own submissions" on public.assignment_submissions
  for select using (
    student_user_id = auth.uid()
    or exists (
      select 1 from public.assignments a
      join public.course_professor_assignments ca on ca.course_id = a.course_id
      where a.id = assignment_submissions.assignment_id and ca.professor_user_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

-- A student can only edit their own submission before it's graded; the
-- assignment's professor (or an admin) can always update it - that's how
-- grading itself happens (setting score/max_score/feedback/graded_by/graded_at).
create policy "ungraded submissions are editable by their student" on public.assignment_submissions
  for update using (student_user_id = auth.uid() and graded_by is null);

create policy "professors and admins grade submissions" on public.assignment_submissions
  for update using (
    exists (
      select 1 from public.assignments a
      join public.course_professor_assignments ca on ca.course_id = a.course_id
      where a.id = assignment_submissions.assignment_id and ca.professor_user_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

-- Tightens Phase 7A's "Published visible to any authenticated user" policy:
-- a Published assignment is now visible only to students actually enrolled
-- in its course (plus its own professor, plus admins) - the real
-- enrollment-validation requirement this phase adds.
drop policy if exists "read published or own assignments" on public.assignments;

create policy "read published-and-enrolled or own assignments" on public.assignments
  for select using (
    (
      status = 'Published'
      and exists (
        select 1 from public.course_enrollments ce
        where ce.course_id = assignments.course_id and ce.student_user_id = auth.uid()
      )
    )
    or professor_user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );
