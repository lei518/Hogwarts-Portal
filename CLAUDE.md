# Hogwarts Portal — Project Vision

This is **not** a story-driven Harry Potter game or a Hogwarts Legacy clone. It's the **Official Hogwarts School of Witchcraft and Wizardry Digital Portal** — the magical-world equivalent of a university student portal.

## Core Product Vision

The objective is to simulate what it would feel like if Hogwarts operated a modern digital campus platform, while preserving the magical atmosphere of the Wizarding World. Every feature should contribute to making the user feel like an actual Hogwarts student. The portal prioritizes **immersion, usability, and authenticity over traditional game mechanics.** RPG-shaped systems (XP, spells, house points, quests) are integrated *into* student life; they don't define the app.

## Design Principles

Every new feature must satisfy these, in order of priority when they conflict:

1. **Portal First.** The application behaves like a real school portal before it behaves like a game.
2. **Magical Second.** Magical elements enhance normal school functions rather than replace them.
3. **Student Perspective.** Every screen answers: *"What would a Hogwarts student expect to find here?"*
4. **One Source of Truth.** Every piece of data has exactly one canonical owner (one page/section that owns it). Every other page references or summarizes that data — it never duplicates it.
5. **Scalable Architecture.** Every new feature fits naturally into the information architecture below without requiring a navigation redesign.
6. **Immersion Before Complexity.** A feature should feel authentic to Hogwarts before it becomes mechanically complex.

**The university-portal litmus test**, applied to every new page before it's built: *"Would this realistically exist on a university's official student portal?"* If yes, find the magical Hogwarts equivalent. If no, reconsider whether it belongs in the portal at all.

## Long-Term Goal

The finished project should feel less like navigating a web application and more like logging into the official online services of Hogwarts School of Witchcraft and Wizardry. A student should be able to, through a single cohesive portal: manage their profile, receive Owl Post, attend classes, track academic progress, learn spells, explore campus life, access school resources, follow announcements, and participate in Hogwarts activities.

---

## Two zones

**Onboarding (Hogwarts traditions preserved only where they make sense academically):** this is a university portal, not a Hogwarts Legacy-style RPG (Phase 6L) — every account is created by an Admin (Display Name, Email, Temporary Password, Role, and for students an Academic Year 1-7 plus, for an already-enrolled Year 2-7 student, a House). There is no self-built character, no story pipeline, and no "Begin Journey": a signed-in student's `Character` is synthesized automatically from their Admin-assigned profile the moment they sign in (`GameContext.tsx`'s auto-synthesis effect), and what happens next is keyed entirely on `year`, gated by `src/journey/` (`getJourneyStage.ts` + `JourneyGate.tsx`):

```
Admin creates account (Display Name, Email, Temp Password, Role [, Year, House])
  -> Sign In
       |
       +-- Professor / Admin -> straight to their own Portal
       |
       +-- Student
             |
             +-- Year 1  -> Wand Ceremony -> Sorting Hat -> Student Portal
             +-- Year 2-4 -> Student Portal directly
             +-- Year 5  -> Patronus Charm (forced once) -> Student Portal
             +-- Year 6-7 -> Student Portal directly
```

Year 1's House comes from the Sorting Hat (unchanged ceremony, `sortingCompleted` boolean on `Character`); an already-enrolled Year 2-7 student's House is Admin-assigned at account creation instead — the Admin never assigns Year 1's house, and the Sorting Hat never runs for Year 2-7. The Patronus Charm (`src/pages/Patronus/Patronus.tsx`) keeps its own unchanged page-level gate (locked below Year 5, shows the saved result once cast) and stays reachable any time for Year 5+ afterward — `JourneyGate` only *forces* a Year-5 student there once, on top of that existing gate.

**The Hogwarts Student Portal** (everything after onboarding, inside `GameLayout`): the ongoing services a student manages day to day. Organized into the information architecture below — not a flat game menu.

---

## Information Architecture (Student Portal)

Seven sections plus one global utility. Every page has exactly one canonical section — other sections may preview or summarize it (per the One Source of Truth principle), but never re-own it.

### 🏠 Home — the portal homepage
Widget-based, aggregates only, owns no data of its own:
- Welcome message
- Today's Schedule *(preview of Academics → Class Schedule)*
- Current Objective *(preview of Student Planner)*
- Recent Owl Post *(preview of the global Owl Post inbox)*
- House Cup summary *(preview of Campus Life → House Cup)*
- School Announcements *(preview of Resources → Announcements)*
- Upcoming Events *(preview of Student Planner / Campus Life → Events)*
- Quick Access shortcuts *(derived from the shared navigation section model, not a separate hand-built list)*

### 🎓 My Profile — the student's complete magical identity
Everything that defines the student as an individual:
- Student Information, House, Year, Blood Status
- Wand
- Patronus Charm *(Year 5+ gate)*
- Character Statistics
- Achievements
- Inventory Summary *(links to the full Inventory page)*
- Academic Summary *(reflects Academics progress; canonical data stays in Academics)*

### 📚 Academics — the largest section; the university's academic-services cluster
- Courses, Class Schedule, Assignments, Spellbook, Potions, Academic Progress, Grades, Transcript, Academic Standing, Semester Summary *(current)*
- Exams, Attendance, Professor Portal authoring, live/dynamic grading *(future)*
- **Courses** is the canonical home for each course (Charms, Potions, Herbology, ...) — professor, classroom, description, required year. Each course has its own detail page (`/courses/:courseId`) with reserved-but-not-yet-built sections for Related Spells, Upcoming Lessons, and Related Owl Post, so those can be added later without a page redesign. `Course.professorId` references Resources → Professor Directory rather than duplicating the professor's name; the reverse (which courses a professor teaches) is computed (`getCoursesForProfessor`), never stored twice. `Course.recommendedBookIds` points at Resources → Hogwarts Library one-directionally — Library has no knowledge of Courses.
- **Class Schedule** is seeded per year (`data/schedules.ts`, keyed by `year`) — only Year 1 exists today; other years show an honest "not published yet" state rather than fabricated data.
- **Assignments** is the shared academic-work model both the Student Portal and the future Professor Portal read from (`data/assignments.ts`). This is the load-bearing seam for that future portal: an `Assignment` (title, description, dueDate, courseId, optional `housePointsReward`/`maxGrade`) is professor-authored/shared data; per-student progress (`AssignmentSubmission`: status, submittedAt, optional `grade`) lives on `Character.assignmentSubmissions`, keyed by assignment id. Every page reads assignments only through `getAssignment`/`getAllAssignments`/`getAssignmentsForCourse` — never by importing the array directly — so when a real Professor Portal replaces the static array with a live, writable, multi-tenant source, no student-facing page needs to change. Submitting one (`SUBMIT_ASSIGNMENT`) is a single reducer case that composes three existing mechanisms in one atomic state change: records the submission, calls `applyHousePointsAward` if the assignment has a reward, and appends a confirmation via `buildOwlPostMessage` - plus a generated Owl Post seed per assignment ("New Assignment: ...") for the year it becomes available.
- **Academic Progress** status (Not Started / In Progress / Completed) is *computed*, not stored on `Character` — `utils/academics.ts`'s `getCourseStatus` now reaches "Completed" once every assignment tied to a course has been submitted; that's the only change Assignments made to this function, exactly as planned when it was written "nothing yet produces Completed."
- Links out to Resources → Hogwarts Library for reading material; the Library page itself is not duplicated here.
- **Grades & Academic Records** (`/grades`, `/transcript`, `/academic-standing`, `/semester-summary`) is a deliberately standalone module — built and verified on its own before any of the milestones below wire into it. `data/grades.ts` seeds one `GradeRecord` per course with realistic sample grades (no dynamic grading logic exists, since no professor can submit a real one yet); Transcript and Semester Summary both read that same seed rather than re-authoring grades a second time. GPA and Credits are honest placeholder strings everywhere they appear, never a fabricated number. The parts that *are* real are read-only aggregates over data other modules already own — Courses Completed/In Progress via `getCourseStatus`, Assignments Submitted via `character.assignmentSubmissions`, House Points Earned via `character.housePointAwards` filtered to academic sources, current semester via Resources → Academic Calendar's term dates — each read through that module's own existing function, never a second copy of the underlying logic. Not yet wired anywhere (by design, this milestone's scope): Professor Portal (would submit `GradeRecord`s, write feedback, approve transcripts — the seam is that `data/grades.ts` is read only through `getGrade`, same seam pattern as `data/assignments.ts`), Assignments (a submitted `AssignmentSubmission.grade` would feed `GradeRecord.currentGrade` instead of the static seed), Dashboard (an Academic Standing / GPA / Latest Grade widget), Planner (grade-release reminders), Owl Post (grade-released notifications).

### 🏰 Campus Life — life around Hogwarts, not a progression system
- Campus Map, House Cup, Student Planner *(current)*
- Common Room expansion, Quidditch, Events, Clubs & Organizations *(future)*
- **Campus Map** is an interactive directory, not a fog-of-war exploration screen: a marker click navigates to `/map/:locationId` (`LocationDetail.tsx`), which shows the location's category, availability, opening hours, related courses, and related services, and marks it discovered on visit. Starting that location's story (if it has one) is a separate, deliberate action on the detail page - selecting a location never launches gameplay by itself.
- **House Cup** shows a `housePointAwards` log (reason, awarded by, amount, timestamp) alongside the leaderboard. Every feature that changes house points - Potions, an adventure ending, the Common Room welcome bonus, and any future one (Quidditch, a professor, a graded assignment) - goes through the single `AWARD_HOUSE_POINTS` action / `applyHousePointsAward` helper in `GameContext.tsx`. House Cup never needs to change to pick up a new source.
- **Student Planner** is the daily workspace, not a quest log. It owns Personal Notes and Reminders directly (`character.personalNotes`/`reminders`); it reflects Current Objectives from `utils/objectives.ts`'s provider registry, Upcoming Classes from Academics, and Assignment Deadlines from `utils/academics.ts`'s `getUpcomingAssignments`; Upcoming Events stays an honest placeholder until an Events system exists. (Home previews the Planner; the Planner is where the student actually manages it.)
- **Objectives are provider-based, not Map-specific**: `utils/objectives.ts` exports `getCurrentObjectives(character)`, which runs a list of `ObjectiveProvider` functions and flattens the results. Today only Campus Map's exploration objective is registered; Academics, Events, House Cup, Assignments, and Tutorials each add their own provider to the same list later - neither Home's Current Focus widget nor the Planner change when that happens.
- **Portal Services**: `types/campusLife.ts`'s `PortalService` interface (reserved, still unconstructed) anticipated administrative services eventually living here. What actually got built is the separate **Student Services** section below — standalone pages, not `Location`-linked `PortalService` records. The two haven't been reconciled (see Student Services' note on this); `PortalService` stays reserved for a future pass that ties them together.

### 🔎 Resources — the portal's information center; reference, not gameplay
- Hogwarts Library, Student Directory, Professor Directory, School Announcements, School Policies, Academic Calendar *(current)*
- **Professor Directory** is the canonical home for staff (name, title, office, hours, bio). Each professor has a detail page (`/professors/:professorId`) with Courses Taught computed from `Course.professorId` (never stored on `Professor`), and reserved-but-not-yet-built sections for Owl Post Contact and Announcements by this Professor.
- **School Announcements** distinguishes Global / Academic / House via `Announcement.category` today, even though the page still lists them together by default with a filter row — the category was designed in from the start so filtering later needs no data change. Home's Announcements widget previews only the latest one; the "Term Begins" announcement also seeds a real Owl Post letter (`data/owlPostSeeds.ts`), built straight from the announcement's own text rather than a second copy.
- **School Policies** is self-contained reference content (Conduct/Safety/Academic/Access categories); it cross-references other canonical data where it naturally applies (e.g. the Hogsmeade policy cites the Year-3+ rule already on that `Location`) rather than duplicating it.
- **Academic Calendar** dates are generated relative to today (`data/academicCalendar.ts`), not hardcoded, so "upcoming" is never stale. The Student Planner's Upcoming Events section reads `getUpcomingCalendarEvents` directly — Academic Calendar stays the one place event dates live.

### 🛎️ Student Services — administrative services, a real-university-portal staple
- Hospital Wing, Owlery Services, Library Services, Hogsmeade Services, Lost & Found, Student Support *(current)*
- Built as a **deliberately standalone module** (per the milestone that created it): no page here reads or writes `Character` state, dispatches a reducer action, or imports another section's data file, except one intentional nav-only `<Link>` each from Owlery Services → `/owl-post` and Library Services → `/library`.
- **Known, accepted near-term duplication**: four of these six pages describe the same physical places Campus Life's `Location` entries and Resources' School Policies already describe (Hospital Wing, Owlery, Hogsmeade, Library) — hours, eligibility, and shop names are seeded independently here rather than read from `data/locations.ts` or `data/policies.ts`. This was the explicit instruction for this milestone ("do not integrate... unless necessary for routing"); reconciling the two into one canonical source is flagged as a future pass, not resolved by inventing a wrong-for-now dependency.
- **Library Services vs. the Library**: two different things. `/library` (Resources) is the book catalog; `/library-services` here is the administrative layer (loans, holds, reading rooms) — the existing Library page and `data/books.ts` were not touched.
- The shared `StudentService`/`ServiceLocation`/`ServiceHours` shapes (`types/studentServices.ts`) give all six pages a consistent masthead (`ServiceHeader.tsx`); each page's specific content (`RecoveryRoom`, `RegisteredOwl`, `BorrowedBook`, `ApprovedShop`, `LostFoundItem`, `SupportService`, ...) is its own independent interface in its own data file — no page reads another's data, and nothing is nested into one mega-object.
- Every page ends with two reserved-but-not-yet-built cards for that service's next increment (e.g. Hospital Wing → Medical Records/Appointment Requests; Lost & Found → Report Lost Item/Claim Item) — same pattern as Course/Professor Detail's reserved sections elsewhere in the portal.
- Not yet wired anywhere (by design): Professor Portal (referrals, welfare notices), Admin Portal (managing Lost & Found / Hospital / Library / Student Support records), Owl Post (appointment confirmations, due-date reminders, lost-item notifications), Planner (upcoming appointments, library due dates), Dashboard (a Student Services widget).

### ⚙️ Settings
Account, save management, preferences. Top-level, single page.

### 📬 Owl Post — global, not a nav section
The official communication system: school announcements, letters from professors, personal correspondence, event invitations. Lives as a persistent header icon (inbox/notification-style), reachable from anywhere — never a section page of its own, and never duplicated as one.

### Home vs. Planner (the recurring resolution pattern)
Home and Planner will always share some content (Current Objective, Upcoming Events). The rule: **Home previews, Planner manages.** Home shows one glanceable item per widget and links out; Planner is the full, actionable, owned-or-reflected list. Apply this same owns-vs-previews split whenever a new page's content would otherwise seem to overlap another section.

## Navigation Architecture

One grouped-section data model — conceptually `sections: { id, label, icon, items }[]` — is the single source of truth for the Sidebar, Mobile Navigation, and Home's Quick Access widget. No page is hand-listed separately in three places. Adding a future page means adding one entry to one section's `items`; every surface picks it up automatically.

**Multi-portal future (Student Portal today; Professor Portal / Staff Portal later):** each portal role gets its own section list, keyed by role, but all roles share the identical section-model shape and the identical Sidebar/BottomNav/Home-widget rendering components. A handful of universal items (Settings, the Owl Post icon) appear in every role's config. Adding a new portal role is "author a new section list for that role," never "fork the navigation system."

**Implementation status:** `src/components/layout/navItems.ts` now implements this — `studentNavigation: NavSection[]`, consumed by the Sidebar, Mobile Nav, and Home's Quick Access widget via `flattenNavigation`. Only the `student` role is populated; `getNavigationForRole` is the seam a future Professor/Staff portal plugs into.

---

## Architecture guidance for new work

- Run every new page through the university-portal litmus test and the Design Principles above before building it.
- Before adding a feature, ask which zone it belongs to first (Onboarding vs. Portal), then which of the six Portal sections it canonically belongs to. A one-time narrative beat is onboarding; anything a student would come back to repeatedly is Portal.
- Apply One Source of Truth: decide the single canonical page for new data before writing it anywhere else as a preview/summary. If two sections both seem to want to own something, use the Home-vs-Planner pattern above (one owns/manages, the other previews/links).
- Route *paths* (`/wand`, `/sorting`, `/dashboard`, etc.) are stable identifiers, not display text — rename headings/nav labels/copy to match this vision, not URLs, unless explicitly asked to.
- Onboarding is closed, not extensible by convention: it's exactly the year-based rules in `journey/getJourneyStage.ts` (Year 1 -> Wand -> Sorting; Year 5 -> Patronus; everything else -> straight to Portal). A new "unlocks partway through a student's education" feature is a page-level gate (`character.year >= N`, matching Patronus's own gate), not a new onboarding step — see the Design Principles' litmus test before adding either.
- Adding a Portal page: add one entry to the correct section in the shared navigation section model (not a standalone list) so Sidebar/Mobile/Home all stay in sync automatically.

This architecture is the project's permanent foundation as of this document. Future architectural decisions and feature implementations should align with it unless explicitly changed.
