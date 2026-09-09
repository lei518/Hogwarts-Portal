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
  -- Phase 5 - Campus Services: four operational staff roles added
  -- alongside student/professor/admin, see
  -- supabase/migrations/0006_campus_services.sql for the additive version,
  -- for an already-live database.
  role text not null default 'student' check (role in ('student', 'professor', 'admin', 'librarian', 'healer', 'caretaker', 'deputy_headmaster')),
  active boolean not null default true,
  -- Account Status (Phase 6E) - see
  -- supabase/migrations/0002_add_profile_status.sql for the additive
  -- version of this column, for an already-live database. `active` above
  -- is fully derived from this column by the trigger below; User
  -- Administration edits `status`, never `active` directly.
  status text not null default 'Active' check (status in ('Active', 'Disabled', 'Locked')),
  -- Year-Based Onboarding (Phase 6L) - see
  -- supabase/migrations/0003_add_profile_year_and_house.sql for the
  -- additive version of these two columns, for an already-live database.
  -- Admin-assigned at account creation; null for professor/admin accounts
  -- and for a self-service /create-account signup (which defaults to a
  -- Year 1 client-side experience instead).
  year integer check (year is null or year between 1 and 7),
  house text check (house is null or house in ('Gryffindor', 'Hufflepuff', 'Ravenclaw', 'Slytherin'))
);

create table public.saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  game_state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Phase 7A - Live Academic Data. See
-- supabase/migrations/0004_academic_live_data.sql for the additive version
-- of these three tables + the new profiles policy, for an already-live
-- database. The seeded course catalog (data/courses.ts) stays in the
-- client; this table is the only source of who teaches a course.
create table public.course_professor_assignments (
  course_id text primary key,
  professor_user_id uuid references public.profiles(user_id) on delete set null,
  assigned_at timestamptz not null default now()
);

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

-- Phase 6 - Communication & Administration System. See
-- supabase/migrations/0007_announcements_and_service_assignments.sql for
-- the additive/alter version of this table's new columns + the
-- service_assignments table, for an already-live database.
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  announcement_type text not null default 'General'
    check (announcement_type in ('General', 'Academic', 'Campus Event', 'Emergency', 'Maintenance')),
  visibility text not null default 'School' check (visibility in ('School', 'Course')),
  course_id text,
  author_user_id uuid references public.profiles(user_id),
  published boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint announcements_visibility_course_check
    check ((visibility = 'Course' and course_id is not null) or (visibility = 'School' and course_id is null))
);

-- Phase 2 - Real Academic Workflow. See
-- supabase/migrations/0005_academic_workflow.sql for the additive version
-- of these two tables + the tightened assignments policy, for an
-- already-live database.
create table public.course_enrollments (
  student_user_id uuid not null references public.profiles(user_id) on delete cascade,
  course_id text not null,
  enrolled_at timestamptz not null default now(),
  primary key (student_user_id, course_id)
);

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

-- Phase 5 - Campus Services & Resource System. See
-- supabase/migrations/0006_campus_services.sql for the additive version of
-- these six tables + the role expansion, for an already-live database.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(user_id),
  receiver_id uuid not null references public.profiles(user_id),
  subject text not null,
  content text not null,
  message_type text not null default 'Direct Message'
    check (message_type in ('Direct Message', 'Announcement', 'Assignment Notification', 'Grade Notification', 'Service Update', 'Reminder')),
  related_service text,
  related_id uuid,
  status text not null default 'Sent' check (status in ('Sent', 'Read')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  category text not null,
  description text not null default '',
  total_copies integer not null default 1,
  available_copies integer not null default 1
);

create table public.book_loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  student_id uuid not null references public.profiles(user_id),
  borrowed_at timestamptz not null default now(),
  due_date date not null,
  returned_at timestamptz,
  status text not null default 'Borrowed' check (status in ('Borrowed', 'Returned', 'Overdue'))
);

create table public.medical_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(user_id),
  reason text not null,
  requested_date date not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Completed', 'Rejected')),
  assigned_staff uuid references public.profiles(user_id),
  created_at timestamptz not null default now()
);

create table public.permits (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(user_id),
  visit_date date not null,
  reason text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  approved_by uuid references public.profiles(user_id),
  created_at timestamptz not null default now()
);

create table public.lost_found_items (
  id uuid primary key default gen_random_uuid(),
  reported_by uuid references public.profiles(user_id),
  item_name text not null,
  description text not null default '',
  location_found text,
  status text not null default 'Reported' check (status in ('Reported', 'Found', 'Claimed')),
  claimed_by uuid references public.profiles(user_id),
  created_at timestamptz not null default now()
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

alter table public.profiles enable row level security;
alter table public.saves enable row level security;
alter table public.course_professor_assignments enable row level security;
alter table public.assignments enable row level security;
alter table public.announcements enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.messages enable row level security;
alter table public.books enable row level security;
alter table public.book_loans enable row level security;
alter table public.medical_requests enable row level security;
alter table public.permits enable row level security;
alter table public.lost_found_items enable row level security;
alter table public.service_assignments enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Additive alongside "own profile" above (Postgres OR-combines multiple
-- permissive policies for the same command) - lets the Student/Professor
-- Directory read real accounts without a privileged Edge Function. Writes
-- stay exactly as they were: only the caller's own row, or a service_role
-- Edge Function.
create policy "authenticated can view active profiles" on public.profiles
  for select using (auth.role() = 'authenticated' and active = true);

create policy "own save" on public.saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "authenticated can view course assignments" on public.course_professor_assignments
  for select using (auth.role() = 'authenticated');

create policy "admins manage course assignments" on public.course_professor_assignments
  for all using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  ) with check (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

-- Phase 2 - tightened from Phase 7A's "Published visible to any
-- authenticated user": a Published assignment is now visible only to
-- students actually enrolled in its course (plus its own professor, plus
-- admins) - the real enrollment-validation requirement this phase adds.
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

create policy "authenticated can view service assignments" on public.service_assignments
  for select using (auth.role() = 'authenticated');

create policy "admins manage service assignments" on public.service_assignments
  for all using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  ) with check (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin' and p.active)
  );

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

create policy "view own messages" on public.messages
  for select using (receiver_id = auth.uid() or sender_id = auth.uid());

create policy "send messages as self" on public.messages
  for insert with check (sender_id = auth.uid());

create policy "receiver marks messages read" on public.messages
  for update using (receiver_id = auth.uid());

create policy "authenticated can view books" on public.books
  for select using (auth.role() = 'authenticated');

create policy "librarians and admins manage books" on public.books
  for all using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('librarian', 'admin') and p.active)
  ) with check (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('librarian', 'admin') and p.active)
  );

create policy "students and librarians view loans" on public.book_loans
  for select using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('librarian', 'admin') and p.active)
  );

create policy "students borrow available books" on public.book_loans
  for insert with check (
    student_id = auth.uid()
    and exists (select 1 from public.books b where b.id = book_id and b.available_copies > 0)
  );

create policy "students and librarians update loans" on public.book_loans
  for update using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('librarian', 'admin') and p.active)
  );

create policy "students and healers view medical requests" on public.medical_requests
  for select using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('healer', 'admin') and p.active)
  );

create policy "students submit medical requests" on public.medical_requests
  for insert with check (student_id = auth.uid());

create policy "healers process medical requests" on public.medical_requests
  for update using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('healer', 'admin') and p.active)
  );

create policy "students and deputy headmaster view permits" on public.permits
  for select using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('deputy_headmaster', 'admin') and p.active)
  );

create policy "students request permits" on public.permits
  for insert with check (student_id = auth.uid());

create policy "deputy headmaster processes permits" on public.permits
  for update using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('deputy_headmaster', 'admin') and p.active)
  );

create policy "authenticated can view lost and found" on public.lost_found_items
  for select using (auth.role() = 'authenticated');

create policy "students report lost items" on public.lost_found_items
  for insert with check (reported_by = auth.uid());

create policy "authenticated can update lost and found items" on public.lost_found_items
  for update using (auth.role() = 'authenticated');

-- Keeps books.available_copies authoritative without granting a student
-- direct UPDATE rights on `books` - mirrors prevent_profile_role_self_escalation's
-- own use of security definer for a narrowly-scoped, safe write.
create or replace function public.adjust_book_availability()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.books set available_copies = available_copies - 1
      where id = NEW.book_id and available_copies > 0;
  elsif TG_OP = 'UPDATE' and OLD.returned_at is null and NEW.returned_at is not null then
    update public.books set available_copies = available_copies + 1
      where id = NEW.book_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_adjust_book_availability
  after insert or update on public.book_loans
  for each row execute function public.adjust_book_availability();

-- Seed content, not live state (same convention as data/*.ts seed files
-- elsewhere in this codebase). Titles/categories reused from
-- src/data/books.ts (the separate Resources reading catalog); authors
-- newly authored for the lending record.
insert into public.books (title, author, category, description, total_copies, available_copies) values
  ('The Standard Book of Spells, Grade 1', 'Miranda Goshawk', 'Charms', 'The foundational charms text every first-year is issued.', 3, 3),
  ('Achievements in Charming', 'Miranda Goshawk', 'Charms', 'A history of famous charms and the witches and wizards who invented them.', 2, 2),
  ('Advanced Potion-Making', 'Libatius Borage', 'Potions', 'A dense, technical text on potion theory, favored by serious brewers.', 2, 2),
  ('One Thousand Magical Herbs and Fungi', 'Phyllida Spore', 'Herbology', 'An illustrated reference of magical plants.', 3, 3),
  ('Defensive Magical Theory', 'Wilbert Slinkhard', 'Defense Against the Dark Arts', 'A cautious, textbook-only approach to defense.', 2, 2),
  ('Curses and Counter-Curses', 'Vindictus Viridian', 'Defense Against the Dark Arts', 'Practical guidance on recognizing and reversing common hexes and jinxes.', 2, 2),
  ('A Beginner''s Guide to Dark Creatures', 'Augustus Worme', 'Dark Arts', 'An unflinching survey of the more dangerous things sharing the wizarding world.', 1, 1),
  ('Hogwarts: A History', 'Bathilda Bagshot', 'History of Magic', 'The definitive account of the castle''s founding, secrets, and centuries of alterations.', 3, 3),
  ('Fantastic Beasts and Where to Find Them', 'Newt Scamander', 'Care of Magical Creatures', 'A comprehensive bestiary of magical creatures found across the world.', 3, 3),
  ('Charting the Heavens', 'Aurora Sinistra', 'Astronomy', 'A star chart and guide to the movements of celestial bodies.', 2, 2),
  ('Intermediate Transfiguration', 'Emeric Switch', 'Transfiguration', 'Building on first-year theory, with an emphasis on precision over power.', 2, 2),
  ('Ancient Runes Made Easy', 'Bridget Wenlock', 'Ancient Magic', 'An introductory text on the runic alphabets underlying much of old magic.', 1, 1);

insert into public.lost_found_items (item_name, description, location_found, status) values
  ('Silver Locket', 'A small silver locket on a chain, no visible inscription.', 'Great Hall', 'Reported'),
  ('Charms Textbook', 'First-year Standard Book of Spells, name worn off the cover.', 'Charms Classroom', 'Reported'),
  ('Single Dragonhide Glove', 'A right-handed dragonhide glove, well used.', 'Potions Classroom', 'Found'),
  ('Gryffindor Scarf', 'House scarf, slightly frayed at one end.', 'Quidditch Pitch', 'Claimed');

-- One row per service, unassigned - no fabricated default staff member.
insert into public.service_assignments (service_name) values
  ('Library'), ('Hospital Wing'), ('Lost & Found'), ('Hogsmeade Permits'), ('Owlery Administration');

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

  -- `active` is always derived from `status`, never set independently -
  -- see migrations/0002_add_profile_status.sql's own comment.
  NEW.active := (NEW.status = 'Active');

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_role_self_escalation();
