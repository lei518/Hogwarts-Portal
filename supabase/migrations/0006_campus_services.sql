-- Phase 5 - Campus Services & Resource System. Additive migration for an
-- already-live database (see 0001-0005 for the same convention).

-- Role expansion: four operational staff roles alongside student/professor/
-- admin, each owning one campus service. The role-escalation trigger
-- (prevent_profile_role_self_escalation) is already role-list-agnostic, so
-- it needs no change here.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('student', 'professor', 'admin', 'librarian', 'healer', 'caretaker', 'deputy_headmaster'));

-- Owlery - the portal's real, cross-account messaging system, replacing
-- the old per-character "Owl Post" (which was never more than a local
-- array embedded in one user's own save). `sender_id` is nullable only
-- because a handful of RLS EXISTS checks below can't easily attribute a
-- system actor; every message this phase actually sends carries a real
-- sender.
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

-- Library Services - a real lending catalog, distinct from data/books.ts's
-- Resources reading/study catalog (untouched by this phase - see
-- CLAUDE.md's own Library vs. Library Services distinction).
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

-- Hospital Wing appointment requests.
create table public.medical_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(user_id),
  reason text not null,
  requested_date date not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Completed', 'Rejected')),
  assigned_staff uuid references public.profiles(user_id),
  created_at timestamptz not null default now()
);

-- Hogsmeade visit permits.
create table public.permits (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(user_id),
  visit_date date not null,
  reason text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  approved_by uuid references public.profiles(user_id),
  created_at timestamptz not null default now()
);

-- Lost & Found reports.
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

alter table public.messages enable row level security;
alter table public.books enable row level security;
alter table public.book_loans enable row level security;
alter table public.medical_requests enable row level security;
alter table public.permits enable row level security;
alter table public.lost_found_items enable row level security;

-- Messages: open messaging between real accounts, like a real inbox - the
-- UI's own recipient picker (not RLS) scopes who a sender would realistically
-- message. Only the receiver marks their own copy read.
create policy "view own messages" on public.messages
  for select using (receiver_id = auth.uid() or sender_id = auth.uid());

create policy "send messages as self" on public.messages
  for insert with check (sender_id = auth.uid());

create policy "receiver marks messages read" on public.messages
  for update using (receiver_id = auth.uid());

-- Books: readable by anyone signed in; only Librarians/Admins manage stock.
create policy "authenticated can view books" on public.books
  for select using (auth.role() = 'authenticated');

create policy "librarians and admins manage books" on public.books
  for all using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('librarian', 'admin') and p.active)
  ) with check (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('librarian', 'admin') and p.active)
  );

-- Book loans: a student sees/borrows their own; Librarians/Admins see and
-- process every loan. `available_copies > 0` at insert time is a
-- best-effort guard, not a fully race-proof reservation - acceptable at
-- this scope; see adjust_book_availability below for the actual count.
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

-- Medical requests: a student sees/submits their own; Healers/Admins see
-- and process every request.
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

-- Permits: a student sees/requests their own; Deputy Headmaster/Admins see
-- and process every request.
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

-- Lost & Found: low-stakes content, readable/updatable by any signed-in
-- user (deliberately broad - see the plan's own note on why a
-- status-transition-aware policy isn't worth the RLS complexity here); only
-- the reporter can create a report under their own name.
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
-- elsewhere in this codebase) - a real lending catalog and a handful of
-- pre-existing Lost & Found records so the pages aren't empty on first run.
-- Titles/categories reused from src/data/books.ts (the separate Resources
-- reading catalog); authors newly authored for the lending record.
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
