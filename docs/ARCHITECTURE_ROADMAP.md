# Hogwarts Portal — Architecture Roadmap (v1.0 → v2.0)

**Status:** Design proposal only. No implementation code. No changes to existing source files.
**Scope:** Everything after Student Portal v1.0.

## 0. Frozen Baseline

Student Portal v1.0 is complete and is treated as a **frozen release** for the purposes of this document:
Authentication, Character Creation, Journey/Onboarding, Dashboard, Courses, Schedule, Assignments, Grades,
Academic Progress, Transcript, Academic Standing, Semester Summary, House, Map, Adventure, Library, Students,
Professors, Announcements, Academic Calendar, Policies, Inventory, Potions, Spells, Owl Post, Student Planner,
Student Services, Settings, Achievements.

Nothing in this roadmap requires rewriting any of the above. Every phase either (a) adds new standalone files, or
(b) — only in Phase 2, and only when actually implemented — adds small additive read functions that existing
pages opt into. No phase merges Student Portal with a future portal, and no phase replaces seeded data as part of
building a feature (that is Phase 5's job, alone).

## 1. Standing Architectural Rules (carried forward, not renegotiated)

These are already established in the v1.0 codebase and every phase below is designed to extend them, not bend them:

| Rule | Where it lives today | Applies to every future phase because |
|---|---|---|
| Navigation is data-driven per role | `components/layout/navItems.ts` — `NavSection`/`NavItem`, `getNavigationForRole(role)`, `flattenNavigation()`. Only `student` is populated today. | Professor/Admin portals are new roles registered in the same map, never edits to `studentNavigation`. |
| Routes are grouped in commented blocks | `App.tsx`, nested under `<Route element={<GameLayout />}>` with `{/* Milestone - see CLAUDE.md */}` comments | Each future portal gets its own top-level route group under its own layout, not squeezed into `GameLayout`. |
| One domain = one data file + one types file | `data/courses.ts`+`types/academics.ts`, `data/grades.ts`+`types/grades.ts`, `data/studentSupport.ts`+`types/studentServices.ts`, etc. | No mega `data/index.ts` or `types/index.ts` ever gets introduced. |
| Reads go through `getX()` / `getXsForY()` | e.g. `getCourse`, `getProfessor`, `getCoursesForProfessor`, `getAssignment`, `getGrade` | This is the exact seam Phase 5 needs — a function call site never changes shape when its body changes from array lookup to network call. |
| Shared card/field primitive | `components/character/ProfileSection.tsx` (`ProfileSection`, `ProfileField`) reused far outside "My Profile" | New portals reuse the same primitive rather than inventing a second card component. |
| Reserved-but-not-built sections | `CourseDetail.tsx`, `ProfessorDetail.tsx` — a `ProfileSection` naming the future feature and what will fill it in | Every new page below ends with the same kind of placeholder cards for its own not-yet-built increment. |
| Standalone-first for a new module | Student Services: no `Character` reads/writes, no reducer dispatch, no cross-module data import except one nav `<Link>` | Professor Portal and Admin Portal both launch this way (Section 3 and 4). |

## 2. Roadmap at a Glance

| Phase | Name | Touches frozen v1.0 files? | Depends on |
|---|---|---|---|
| 2 | Integration Layer | Yes — additive only, inside Student Portal | Nothing new; closes seams v1.0 already reserved |
| 3 | Professor Portal | No | Nothing (standalone, mirrors Student Services) |
| 4 | Admin Portal | No | Nothing (standalone; may *read* Phase 3's types later, not required to launch) |
| 5 | Backend Migration | Yes — `data/*.ts` bodies only, call sites unchanged | Phases 2–4 domain boundaries settled |
| 6 | Polish | Cross-cutting, low-risk | Everything above exists |

Recommended build order: **2 → 3 → 4 → 5 → 6**. Phase 3 and 4 are mutually independent and could swap order or run
in parallel; Phase 2 should land first because it is the cheapest, lowest-risk phase and it retires the largest
number of "not yet wired" notes already sitting in `CLAUDE.md`. Phase 5 should not start until 2–4 are stable,
because migrating a data file mid-redesign means migrating it twice.

---

## Phase 2 — Integration Layer

### 2.1 What this phase actually is

Phase 2 is **not** about connecting a new portal to the Student Portal — there is no new portal yet at this point
in the sequence. It is about closing the specific integration seams that Student Portal v1.0 already documented as
deliberately deferred. Pulling directly from the standing seam list:

- Grades → Dashboard (an Academic Standing / GPA / Latest Grade widget)
- Grades → Planner (grade-release reminders)
- Grades → Owl Post (grade-released notifications)
- Assignments → Grades (`AssignmentSubmission.grade` feeding `GradeRecord.currentGrade`, once something can set it)
- Student Services → Owl Post (appointment confirmations, due-date reminders, lost-item notifications)
- Student Services → Planner (upcoming appointments, library due dates)
- Student Services → Dashboard (a Student Services summary widget)
- `utils/objectives.ts` provider registry → Academics, Events, House Cup, Assignments, and Tutorials each
  registering their own `ObjectiveProvider` (today only Campus Map's is registered)

None of this requires a Professor or Admin portal to exist. All of it is Student Portal talking to itself across
module boundaries it always intended to cross, using the mechanisms it already built for that purpose.

### 2.2 The rule that keeps modules independent

**A module may be *read* by another module's summary/preview logic. A module's canonical data may never be
written by, or duplicated into, another module.** Concretely:

- Dashboard's new Academic Standing widget calls `utils/grades.ts`'s existing `getAcademicStanding(character)` —
  it does not read `data/grades.ts` directly, and it does not store a cached copy of the standing on `Character`.
- Planner's new grade-release reminder is *computed*, not stored: a small function inspects `data/grades.ts` via
  `getGrade` and today's date (same pattern as `getUpcomingCalendarEvents`), it is not a new `reminders` entry
  written into `Character` by a reducer action.
- Owl Post's new grade-released message is seeded the same way `data/owlPostSeeds.ts` already seeds the
  "Term Begins" letter from Announcements' own text — built from Grades' own data, not authored a second time.
- This is the same discipline Home vs. Planner already follows ("Home previews, Planner manages") — Phase 2 is
  that pattern applied to every remaining pair of modules that still owe each other a connection.

### 2.3 Per-integration design

**Dashboard ← Grades / Academic Standing**
- New read-only widget on `Dashboard.tsx` calling the existing `getAcademicStanding(character)` and
  `getSemesterSummary(character)` from `utils/grades.ts`. No new type, no new data file — this is pure
  composition of functions that already exist and already return everything the widget needs (`standing`, `gpa`
  placeholder string, `coursesCompleted`, etc.).
- Non-goal: Dashboard does not gain a "Latest Grade" concept beyond what `GradeRecord`/`TranscriptRecord` already
  express. If a truly "latest" grade needs a timestamp later, that field is added to `GradeRecord` in Grades'
  own type file, not invented on Dashboard.

**Assignments ↔ Grades**
- Today `AssignmentSubmission.grade` and `GradeRecord.currentGrade` are two separate optional fields with no
  connection — `Assignment.maxGrade` and `AssignmentSubmission.grade` are typed and unused. Phase 2 defines (not
  implements) a pure function `deriveGradeFromSubmissions(courseId, character): Partial<GradeRecord> | null` in
  `utils/grades.ts` that, when at least one submission for that course has a `grade` set, computes a suggested
  `currentGrade`/`percentage`. This is offered as an *input* to Grades' existing display, never a silent
  overwrite of the seeded `GradeRecord` — until Phase 3's Grade Management gives a professor an actual grading
  action, nothing sets `AssignmentSubmission.grade` in the first place, so this function has no live callers yet
  and is documented as dead code intentionally, the same way `Assignment.maxGrade` has been since Assignments
  shipped.
- This keeps Grades the sole writer of `GradeRecord` and Assignments the sole writer of `AssignmentSubmission` —
  the derivation function is a bridge, not a new owner.

**Planner ← Grades**
- New `getGradeReleaseReminders(character): PlannerReminderPreview[]` in `utils/grades.ts` (or a small new
  `utils/plannerIntegrations.ts` if keeping `utils/grades.ts` free of Planner-shaped return types is preferred —
  a call the Phase 2 implementer makes, documented here as the two acceptable options). Planner renders these
  alongside its existing owned `reminders`, visually distinguished (e.g. a "Grades" tag) but never merged into
  `character.reminders` itself.

**Owl Post ← Grades, ← Student Services**
- Both follow the exact `data/owlPostSeeds.ts` precedent: a seed function builds an `OwlPostMessage`-shaped
  object from the owning module's own data (a released `GradeRecord`, a Student Services appointment/due date),
  appended through the existing `buildOwlPostMessage` helper path — not a new message-authoring system.

**Student Services ← → Planner / Dashboard**
- Same shape as the Grades integrations above: Planner and Dashboard gain small read-only preview calls into
  each Student Services page's own data file (e.g. `getUpcomingLibraryDueDates()` added to `data/libraryServices.ts`
  or a thin `utils/studentServices.ts`), Student Services' data files remain the only writers of their own data.

**Objectives registry**
- Each module that CLAUDE.md already flags as a future `ObjectiveProvider` (Academics, Events, House Cup,
  Assignments, Tutorials) adds one function matching the existing `ObjectiveProvider` signature and appends it to
  `utils/objectives.ts`'s provider list. Home's Current Focus widget and the Planner do not change — this is the
  entire point of the provider-registry design from v1.0.

### 2.4 Files (when this phase is actually implemented)

| New | Modified (additive only) | Untouched |
|---|---|---|
| Possibly `utils/plannerIntegrations.ts` (optional split) | `utils/grades.ts` (new exported functions, no signature changes to existing ones), `utils/objectives.ts` (new providers appended to the list), `data/owlPostSeeds.ts` (new seed entries), `pages/Dashboard/Dashboard.tsx` (new widget), `pages/StudentPlanner/*` (new reminder section) | `types/character.ts`, `context/GameContext.tsx` reducer shape (no new actions required — everything here is a read, not a write), `data/grades.ts`, `data/assignments.ts`, all Student Services pages/data |

### 2.5 Explicit non-goals of Phase 2

- No new reducer action. Every integration above is a **read**, computed at render time or via a `getX()`
  call — nothing here needs `GameContext` to change shape.
- No Professor-authored grading yet — `deriveGradeFromSubmissions` is specified but has no caller until Phase 3.
- No backend — this phase is pure in-memory function composition, same as everything in v1.0.

---

## Phase 3 — Professor Portal

### 3.1 Philosophy

Identical to how Student Services was introduced: **build the module first, integrate it later.** The Professor
Portal is a second, parallel portal that happens to live in the same repository and reuse the same UI primitives,
theme, and navigation *pattern* — it does not read `Character`, does not dispatch any `GameAction`, and does not
import from `context/GameContext.tsx` at all. It has its own notion of "who is logged in" (a professor identity),
scoped entirely to its own files, described in Section 3.7 as a seam rather than built now.

### 3.2 Folder structure

```
src/
  pages/professor/
    Dashboard/ProfessorDashboard.tsx
    Courses/MyCourses.tsx
    Courses/TeachingCourseDetail.tsx        (/professor/courses/:courseId)
    Roster/StudentRoster.tsx
    Assignments/AssignmentManagement.tsx
    Assignments/AssignmentEditor.tsx        (/professor/assignments/:assignmentId)
    Grades/GradeManagement.tsx
    OfficeHours/OfficeHours.tsx
    Announcements/ProfessorAnnouncements.tsx
    Profile/ProfessorProfile.tsx
  components/professor/
    ProfessorLayout.tsx                     (own chrome, parallel to GameLayout)
    ProfessorSidebar.tsx / ProfessorBottomNav.tsx   (or: extend Sidebar/BottomNav to accept a NavSection[] prop — see 3.5)
    RosterEntryCard.tsx
    TeachingCourseCard.tsx
  types/
    professorProfile.ts
    teachingCourse.ts
    studentRoster.ts
    officeHours.ts
    professorAnnouncements.ts
  data/
    professorProfile.ts
    teachingCourses.ts
    studentRoster.ts
    officeHours.ts
    professorAnnouncements.ts
  utils/
    professorPortal.ts     (cross-page pure helpers that are Professor-Portal-only, e.g. roster filtering)
```

This mirrors the existing convention exactly: one page folder per route, one type file per domain, one data file
per domain, no `types/professor.ts` mega-file and no `data/professorPortal.ts` mega-file.

### 3.3 Data model

Five independent interfaces, each in its own file, none nested inside a shared envelope — matching how
`types/studentServices.ts` deliberately keeps `RecoveryRoom`/`ApprovedShop`/etc. as separate interfaces per page
rather than one `StudentServicesData` object.

```ts
// types/professorProfile.ts
export interface ProfessorProfile {
  id: string;                 // matches an existing data/professors.ts Professor.id — see 3.7
  displayName: string;
  title: string;
  department: string;
  officeLocation: string;
  bio: string;
  yearsAtHogwarts?: number;
}
```

```ts
// types/teachingCourse.ts
// Deliberately separate from Resources' Course (types/academics.ts) even though
// it describes overlapping ground - see 3.7 for why these are not merged yet,
// same reasoning Student Services used for Hospital Wing vs. the Location entry.
export interface TeachingCourse {
  id: string;
  courseId: string;           // one-directional reference to data/courses.ts, never duplicated fields
  professorId: string;        // references ProfessorProfile.id
  section: string;             // e.g. "Year 1 - Section A"
  enrolledStudentIds: string[];
  meetingPattern: string;      // human-readable, e.g. "Mon/Wed/Fri 10:00-11:00"
}
```

```ts
// types/studentRoster.ts
export type RosterStanding = "On Track" | "Needs Attention" | "Excelling";

export interface StudentRosterEntry {
  id: string;
  studentName: string;        // read-only display data, not linked to a live Student record yet - see 3.7
  house: string;
  year: number;
  teachingCourseId: string;
  standing: RosterStanding;
  attendanceNote?: string;
}
```

```ts
// types/officeHours.ts
export type OfficeHourDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface OfficeHour {
  id: string;
  professorId: string;
  day: OfficeHourDay;
  startTime: string;          // "HH:MM", matches ScheduleEntry's convention
  endTime: string;
  location: string;
  note?: string;
}
```

```ts
// types/professorAnnouncements.ts
export type ProfessorAnnouncementAudience = "All My Students" | "Specific Course";

export interface ProfessorAnnouncement {
  id: string;
  professorId: string;
  title: string;
  body: string;
  audience: ProfessorAnnouncementAudience;
  teachingCourseId?: string;   // required when audience is "Specific Course"
  postedAt: string;            // ISO date
}
```

Each interface deliberately references other domains **by id only** (`professorId`, `courseId`, `teachingCourseId`)
— exactly the `Course.professorId` / `getCoursesForProfessor()` pattern already established, never a nested
object copy.

### 3.4 Seed data vs. computed

| Lives in `data/` (authored/seeded) | Computed by a utility (never stored) |
|---|---|
| `professorProfile.ts` — one seeded `ProfessorProfile` (the "current" logged-in professor for this milestone; see 3.7 on auth) | Courses taught *elsewhere* — this portal does not need to compute anything into Resources; `getCoursesForProfessor` already exists there for other pages to use, unrelated to this data |
| `teachingCourses.ts` — seeded `TeachingCourse[]`, `getTeachingCourse(id)`, `getTeachingCoursesForProfessor(professorId)` | Roster **size** per course — `getRosterForCourse(teachingCourseId)` filters `studentRoster.ts`'s array rather than `TeachingCourse` storing a count that could drift |
| `studentRoster.ts` — seeded `StudentRosterEntry[]`, `getRosterForCourse(teachingCourseId)` | Dashboard summary counts (e.g. "3 courses, 42 students, 2 assignments due for grading") — computed at render by a `professorPortal.ts` helper that calls the other domains' `getX()` functions, never persisted |
| `officeHours.ts` — seeded `OfficeHour[]`, `getOfficeHoursForProfessor(professorId)` | — |
| `professorAnnouncements.ts` — seeded `ProfessorAnnouncement[]`, `getAnnouncementsForProfessor(professorId)`, `getAnnouncementsForCourse(teachingCourseId)` | — |

Assignment Management and Grade Management are the two pages that *authored* domain data belongs to, but per the
"no integration yet" rule they do **not** write into the existing frozen `data/assignments.ts` / `data/grades.ts`
in this phase (see 3.6) — they get their own seeded arrays scoped to the Professor Portal:

```ts
// data/professorAssignments.ts (Professor-Portal-owned, deliberately parallel to data/assignments.ts)
export const professorAssignments: ProfessorAssignmentDraft[] = [ /* seeded, mirrors a subset of data/assignments.ts shape */ ];
export function getProfessorAssignments(professorId: string): ProfessorAssignmentDraft[]
```

```ts
// data/professorGrades.ts (Professor-Portal-owned, deliberately parallel to data/grades.ts)
export const professorGradeEntries: ProfessorGradeEntry[] = [ /* seeded */ ];
export function getGradeEntriesForCourse(teachingCourseId: string): ProfessorGradeEntry[]
```

This avoids the trap of half-integrating on day one: Assignment/Grade Management pages are fully functional
against their own seeded data, and Section 3.7 documents exactly how a later phase points them at the real
`data/assignments.ts`/`data/grades.ts` instead.

### 3.5 Page responsibilities

| Page | Route | Owns | Reads (read-only) |
|---|---|---|---|
| Professor Dashboard | `/professor/dashboard` | Nothing — summaries only | `teachingCourses`, `studentRoster`, `professorAssignments`, `professorGradeEntries`, `officeHours` counts via small aggregator functions in `utils/professorPortal.ts` |
| My Courses | `/professor/courses`, `/professor/courses/:courseId` | Canonical owner of `TeachingCourse` (which sections this professor teaches, meeting pattern, roster linkage) | `data/courses.ts`'s `getCourse` for the underlying course's name/description, purely for display |
| Student Roster | `/professor/roster` | Nothing new — read-only view over `studentRoster.ts` | `teachingCourses` (to group by course) |
| Assignment Management | `/professor/assignments`, `/professor/assignments/:assignmentId` | Canonical owner of `professorAssignments.ts` (professor-authored assignment drafts, in this phase's own scope) | `teachingCourses` (to attribute an assignment to a course) |
| Grade Management | `/professor/grades` | Canonical owner of `professorGradeEntries.ts` | `studentRoster`, `professorAssignments` |
| Office Hours | `/professor/office-hours` | Canonical owner of `OfficeHour[]` | — |
| Announcements | `/professor/announcements` | Canonical owner of `ProfessorAnnouncement[]` | `teachingCourses` (for "Specific Course" audience labels) |
| Professor Profile | `/professor/profile` | Canonical owner of `ProfessorProfile` | — |

Every page ends with two reserved-but-not-yet-built `ProfileSection` cards for its next increment, exactly the
Course/Professor Detail and Student Services precedent — e.g. Assignment Management → "Publish to Students" /
"Bulk Import"; Grade Management → "Release Grades" / "Grade History"; Office Hours → "Student Booking Requests" /
"Recurring Schedule Templates".

### 3.6 Navigation

New `professorNavigation: NavSection[]` added to `navItems.ts` alongside (not replacing) `studentNavigation`,
registered as the `"professor"` entry in the existing `navigationByRole` map — the exact seam
`getNavigationForRole` was built for:

```ts
export const professorNavigation: NavSection[] = [
  { id: "professor-dashboard", label: "Dashboard", icon: LayoutDashboard, items: [ /* /professor/dashboard */ ] },
  { id: "teaching", label: "Teaching", icon: GraduationCap, items: [
      /* /professor/courses, /professor/roster */
  ] },
  { id: "coursework", label: "Coursework", icon: ClipboardList, items: [
      /* /professor/assignments, /professor/grades */
  ] },
  { id: "engagement", label: "Engagement", icon: Megaphone, items: [
      /* /professor/office-hours, /professor/announcements */
  ] },
  { id: "profile", label: "Profile", icon: User, items: [ /* /professor/profile */ ] },
];
```

It deliberately does **not** feel like a copy of Student navigation: Student groups by *life domain* (Academics,
Campus Life, Resources); Professor groups by *professional workflow* (Teaching, Coursework, Engagement) — a
different information architecture for a different job to be done, per the brief's instruction not to copy it
wholesale.

`Sidebar.tsx`/`BottomNav.tsx` today hardcode `studentNavigation`. Rather than forking them into
`ProfessorSidebar`/`ProfessorBottomNav` duplicate components, the recommended approach is to add a `sections:
NavSection[]` prop to the existing components (default `= studentNavigation` so Student Portal call sites need no
change) and have a new `components/professor/ProfessorLayout.tsx` render them with `professorNavigation` — one
component, two configurations, matching the "identical Sidebar/BottomNav/Home-widget rendering components" intent
already written into `CLAUDE.md`'s navigation section. (This is the one place this phase touches a frozen v1.0
file, and only to add an optional prop with a default — no existing call site's behavior changes.)

### 3.7 Extension points (explicitly not built now)

| Future integration | How it plugs in later, without redesigning this phase |
|---|---|
| **Student Portal** | `StudentRosterEntry` gains an optional `studentCharacterId?: string` field pointing at a real `Character`/account id; until real accounts exist for "students" from a professor's perspective, roster entries stay display-only seed data. |
| **Assignments (Student Portal)** | `professorAssignments.ts` is retired and Assignment Management is repointed at the existing `data/assignments.ts` via its existing `getAllAssignments`/`getAssignmentsForCourse` — the whole reason Assignments already funnels every read through those functions instead of the array. Writing becomes possible once those functions grow a companion write path (`Phase 5` territory). |
| **Grades (Student Portal)** | Same shape: `professorGradeEntries.ts` is retired in favor of writing real `GradeRecord`s into `data/grades.ts`, using Phase 2's `deriveGradeFromSubmissions` as the suggested-value input to a grading UI. |
| **Owl Post** | Announcements and Office Hours both become natural Owl Post message sources later (e.g. "New Announcement from Professor Snape"), using the same `buildOwlPostMessage`/seed pattern as `data/owlPostSeeds.ts` — no new messaging system. |
| **Planner** | Office Hours becomes a source Planner can read for "upcoming appointments," same additive-read pattern as Phase 2. |
| **Dashboard** | A future "My Classes" widget for professors mirrors the Student Dashboard's existing widget-composition style — not built in this phase since Professor Portal has its own dashboard. |
| **Admin Portal** | Admin's future Professor Records page reads `ProfessorProfile` the same read-only way Admin reads everything else (Section 4) — Professor Portal never needs to know Admin exists. |
| **Backend** | Every `data/professor*.ts` file already exposes only `getX()`/`getXsForY()` functions to its pages — Phase 5 swaps bodies, not call sites, identically to every other domain. |
| **Authentication** | This phase seeds exactly one `ProfessorProfile` and treats it as "the logged-in professor," with no login screen of its own. A real multi-professor login is an `AuthContext`-level seam: today's `AuthContext` already distinguishes a signed-in user from a `Character`; a `role: "student" | "professor"` claim on that same session is the natural extension point, not a parallel auth system. |

### 3.8 Explicit non-goals

- No shared reducer, no `GameContext` changes, no new `GameAction`.
- No writes into `data/assignments.ts`, `data/grades.ts`, `data/students.ts`, or `data/professors.ts` — Assignment/
  Grade Management use their own seeded files (3.4); Student Roster and My Courses only *read* the existing
  `Professor`/`Course` data for display labels.
- No professor login flow — one seeded `ProfessorProfile` stands in for "current professor."
- No Owl Post, Planner, Dashboard, or House Cup wiring — listed in 3.7 as future, not built here.
- No shared layout component fork beyond the one optional prop described in 3.6.

### 3.9 Files

| New | Modified (minimal, additive) | Untouched |
|---|---|---|
| All files listed in 3.2's tree (11 pages, 1 layout + 2 nav components or 1 shared-prop change, 5 types, 5–7 data files, 1 utils file) | `navItems.ts` (new `professorNavigation` export + `navigationByRole["professor"]` entry), `App.tsx` (new grouped route block under a new `<Route element={<ProfessorLayout />}>`), `Sidebar.tsx`/`BottomNav.tsx` (new optional `sections` prop, default unchanged) | Everything else in `src/` — `GameContext.tsx`, all Student pages, all Student data/types, `JourneyGate.tsx`, all Student Services files |

---

## Phase 4 — Admin Portal

### 4.1 Philosophy

Same standalone-first launch as Phase 3. Admin Portal is a third parallel portal, its own role in the navigation
map, its own layout, its own route group. It is explicitly the "back office" — the university-portal litmus test
here is *"would a real university registrar's/IT office's internal admin tool have this screen?"*, not a
student- or professor-facing concern.

### 4.2 Folder structure

```
src/
  pages/admin/
    Dashboard/AdminDashboard.tsx
    StudentRecords/StudentRecords.tsx           (+ /admin/students/:id detail)
    ProfessorRecords/ProfessorRecords.tsx        (+ /admin/professors/:id detail)
    UserAdministration/UserAdministration.tsx
    ServicesManagement/ServicesManagement.tsx
    CalendarManagement/CalendarManagement.tsx
    HouseCupManagement/HouseCupManagement.tsx
    ResourceManagement/ResourceManagement.tsx
    Analytics/Analytics.tsx
  components/admin/
    AdminLayout.tsx
    AdminDataTable.tsx        (generic sortable/filterable table shell reused by every Records/Management page)
    AdminStatCard.tsx
  types/
    adminUserAccount.ts
    adminAuditEntry.ts
  data/
    adminUserAccounts.ts
    adminAuditLog.ts
  utils/
    adminAggregates.ts        (pure read-only aggregation across other domains, for Analytics + Dashboard)
```

Notably thin on new `types/`/`data/` files compared to Phase 3 — most Admin pages are **read/moderate views over
data other modules already own** (see 4.3), not new canonical owners. This mirrors how Grades' Academic Standing
was "real aggregates over data other modules already own... never a second copy of the underlying logic."

### 4.3 Data model and ownership

| Page | New canonical data it owns | What it reads from elsewhere (read-only) |
|---|---|---|
| Admin Dashboard | Nothing | Aggregates from every row below via `adminAggregates.ts` |
| Student Records | Nothing — `Character` stays Student Portal's own canonical record | `data/students.ts` (existing public directory data) for browsing; a real per-student detail view stays a future seam (Section 4.6) until there's a real multi-account backend to browse (Phase 5) |
| Professor Records | Nothing | `data/professors.ts`, and once Phase 3 exists, `data/professorProfile.ts`/`teachingCourses.ts` |
| User Administration | **New**: `AdminUserAccount` (role, status, last-login placeholder) — this is genuinely new because no v1.0 module has an "account administration" concept, only `AuthContext`'s session and `Character` | Nothing structurally, but displays alongside Student/Professor identity data for correlation |
| Services Management | Nothing | `data/hospitalWing.ts`, `owleryServices.ts`, `libraryServices.ts`, `hogsmeadeServices.ts`, `lostAndFound.ts`, `studentSupport.ts` — read + a moderation-style view; per CLAUDE.md these six files were seeded independently, so this page is genuinely the first place all six are viewed together |
| Calendar Management | Nothing new — `data/academicCalendar.ts` stays canonical | Reads/reviews `academicCalendar.ts`'s generated events |
| House Cup Management | Nothing new — `character.housePointAwards` / `AWARD_HOUSE_POINTS` stays canonical | Reads the award log the same way the existing House Cup page does |
| Resource Management | Nothing new | `data/books.ts`, `data/policies.ts` — a moderation view over Library/Policies content |
| Analytics | Nothing — pure aggregation, never a new source of truth | Everything above, via `adminAggregates.ts` |

**Design rule carried over from Grades' Academic Standing precedent:** Admin Portal is built almost entirely as a
*reading and reviewing* layer over data other modules already canonically own. The only genuinely new owned data
is `AdminUserAccount` (account/role administration has no existing home) and, if the implementer chooses to track
who-changed-what, `AdminAuditEntry`. Everything else is read-only in this phase — **no Admin page in this phase
writes into another module's data file.** Write actions (approve a lost-item claim, edit a course, adjust a
professor's office hours from Admin) are named explicitly in 4.6 as future work, not built now.

```ts
// types/adminUserAccount.ts
export type AccountRole = "student" | "professor" | "admin";
export type AccountStatus = "Active" | "Suspended" | "Pending";

export interface AdminUserAccount {
  id: string;
  displayName: string;
  role: AccountRole;
  status: AccountStatus;
  linkedCharacterId?: string;   // optional link to an existing Character, by id only
  linkedProfessorId?: string;   // optional link to an existing ProfessorProfile, by id only
}
```

```ts
// types/adminAuditEntry.ts
export interface AdminAuditEntry {
  id: string;
  actor: string;          // display name, not a live session reference
  action: string;         // free text, e.g. "Suspended account"
  targetId: string;
  timestamp: string;      // ISO date
}
```

### 4.4 Page responsibilities

Same "canonical owner vs. read-only view" split as everywhere else in the codebase — restated explicitly per page
since Admin's whole value proposition is aggregation, so this boundary matters more here than anywhere else:

- **Admin Dashboard** — summaries only, exactly like Professor Dashboard and Home.
- **Student Records** — a directory/browse view (extends what `data/students.ts` already seeds); not a second
  `Character` store.
- **Professor Records** — a directory/browse view over `Professor` + (once it exists) `ProfessorProfile`.
- **User Administration** — the one page with genuinely new canonical data (`AdminUserAccount[]`).
- **Services Management** — a review dashboard over the six Student Services data files, read-only in this phase.
- **Calendar Management** — a review dashboard over `academicCalendar.ts`'s generated events.
- **House Cup Management** — a review dashboard over `housePointAwards`; any future "award points as Admin"
  action still goes through the existing single `AWARD_HOUSE_POINTS` action, never a second points-mutation path.
- **Resource Management** — a review dashboard over Library books and School Policies.
- **Analytics** — pure computed aggregates (enrollment counts, house point trends, assignment completion rates)
  via `adminAggregates.ts`; never a place any number is hand-entered.

Every page ends with the same two-reserved-cards pattern for its next increment (e.g. User Administration →
"Create Account" / "Bulk Role Import"; House Cup Management → "Award Points" / "Deduct Points"; the write actions
Section 4.6 defers).

### 4.5 Navigation

Third entry in `navigationByRole`:

```ts
export const adminNavigation: NavSection[] = [
  { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard, items: [ /* /admin/dashboard */ ] },
  { id: "records", label: "Records", icon: FolderOpen, items: [
      /* /admin/students, /admin/professors, /admin/users */
  ] },
  { id: "operations", label: "Operations", icon: Settings2, items: [
      /* /admin/services, /admin/calendar, /admin/house-cup, /admin/resources */
  ] },
  { id: "insights", label: "Insights", icon: BarChart3, items: [ /* /admin/analytics */ ] },
];
```

Grouped by *operational concern* (Records / Operations / Insights) — a third distinct information architecture,
reinforcing that each portal's nav reflects its own job, not a template stamped three times. Uses the same
`AdminLayout` + shared `Sidebar`/`BottomNav` `sections` prop introduced in Phase 3.6 — Phase 4 adds no further
changes to those shared components.

### 4.6 Extension points (explicitly not built now)

| Future integration | How it plugs in later |
|---|---|
| **Student Portal** | Student Records' detail view gains real per-`Character` drill-down once there's a real backend listing actual accounts (Phase 5), not the static `data/students.ts` directory. |
| **Professor Portal** | Professor Records reads Phase 3's `ProfessorProfile`/`TeachingCourse` directly once Phase 3 exists — no change needed on Phase 3's side, since it's a read-only consumer. |
| **Services Management writes** | "Approve," "Resolve," "Assign" actions on Lost & Found / Hospital Wing / Library Services become real once those six pages' data files grow a write path — same Phase 5 shape as everywhere else. |
| **House Cup Management writes** | An "Award Points as Admin" button dispatches the existing `AWARD_HOUSE_POINTS` action with `awardedBy: "Administration"` — no new mutation path, just a new caller. |
| **Backend** | `AdminUserAccount`/`AdminAuditEntry` and every read-only aggregate follow the identical `getX()` seam as every other domain. |
| **Authentication** | `AccountRole` on `AdminUserAccount` is the natural place a real role-based access control check reads from once real auth exists — Admin Portal itself does not implement access control in this phase (see 4.7). |

### 4.7 Explicit non-goals

- No write/mutate actions on any other module's data (Services, Calendar, House Cup, Resources) — this phase is
  read/review only, with write actions explicitly reserved-card-placeholders.
- No real access control / permission enforcement — there is no real multi-account backend yet to enforce it
  against; `AccountRole` is typed and displayed, not gated on.
- No merging of Student/Professor/Admin — Admin reads across module boundaries the same read-only way Dashboard
  previews Planner, it does not absorb their data.
- No analytics beyond pure computed aggregates over existing data — no new metrics requiring new persisted state.

### 4.8 Files

| New | Modified (minimal, additive) | Untouched |
|---|---|---|
| All files in 4.2's tree (9 pages, 1 layout + 2 shared components, 2 types files, 2 data files, 1 utils file) | `navItems.ts` (new `adminNavigation` export + `navigationByRole["admin"]` entry), `App.tsx` (new route block under a new `<Route element={<AdminLayout />}>`) | Everything else, including all of Phase 3's Professor Portal files (read-only consumer, never a co-owner) |

---

## Phase 5 — Backend Migration

### 5.1 Why the current architecture already supports this

Every domain in the codebase already funnels its reads through named functions (`getCourse`, `getGrade`,
`getCoursesForProfessor`, and — after Phases 2–4 — `getTeachingCoursesForProfessor`, `getRosterForCourse`, etc.)
rather than pages importing `data/*.ts` arrays directly (with the one documented exception: bulk-list consumers
of `grades` and a few similar arrays import the array directly for `.map()`-style rendering, per the existing
codebase survey). This means the **shape of the migration is almost entirely mechanical**: replace what's inside
a `data/*.ts` file; leave every page that calls its functions alone.

The one real gap: today every `getX()` function is **synchronous** (`Array.find`/`Array.filter` over an in-memory
array). A real backend call is asynchronous. This is the one place Phase 5 requires page-level changes, and it is
scoped precisely below.

### 5.2 Layered architecture

```
pages/  →  (existing getX() call sites, unchanged in spirit)
  ↓
data/<domain>.ts        — today: seed array + getX(). After migration: re-exports from repositories/, keeps the
                           same function names/signatures so nothing importing "../data/courses" needs to change
                           its import path.
  ↓
repositories/<domain>Repository.ts   — NEW layer. One per domain (courseRepository.ts, gradeRepository.ts, ...).
                           Owns the actual fetch — Supabase today, swappable later. Returns the same types as the
                           domain's types/ file always has.
  ↓
services/supabase.ts     — already exists (used today for account/cloud-save sync); repositories consume the
                           same configured client rather than each repository re-initializing Supabase.
```

`data/<domain>.ts` becomes a **thin compatibility shim** during migration: it keeps exporting `getCourse`,
`getAllCourses`, etc., but each now returns a `Promise` and delegates to `repositories/courseRepository.ts`. This
is a deliberate two-step migration, not a one-shot rewrite:

1. **Step A (per domain, independently sequenceable):** introduce `repositories/<domain>Repository.ts` backed by
   Supabase; `data/<domain>.ts`'s functions become `async` wrappers around it; every call site that used to do
   `const course = getCourse(id)` becomes `const course = await getCourse(id)`, and the smallest possible number
   of surrounding components pick up a loading state (see 5.4). No type in `types/` changes.
2. **Step B (once all domains are migrated):** the seed arrays themselves can be deleted from `data/` and moved
   into actual Supabase tables/seed migrations, at which point `data/<domain>.ts` is nothing but the repository
   re-export.

Domains can be migrated **one at a time, in any order**, because they were already isolated from each other by
the One Source of Truth principle — migrating `grades` to Supabase does not require touching `courses` or
`professorAssignments` in the same change.

### 5.3 Repository interface shape (illustrative, not exhaustive)

```ts
// repositories/courseRepository.ts
export interface CourseRepository {
  getById(id: string): Promise<Course | undefined>;
  getAll(): Promise<Course[]>;
  getForProfessor(professorId: string): Promise<Course[]>;
}

export function createSupabaseCourseRepository(client: SupabaseClient): CourseRepository { /* ... */ }
```

Each repository interface's method names map 1:1 onto the domain's existing `getX()`/`getXsForY()` functions —
the interface is discovered by reading the current `data/` file's exports, not invented fresh. This keeps the
migration a rename-and-relocate operation rather than a redesign.

### 5.4 Handling asynchrony without a page-by-page redesign

- Pages that call a single `getX(id)` today for a detail view (`CourseDetail`, `ProfessorDetail`,
  `TeachingCourseDetail`, etc.) add one `useEffect` + `useState` loading pair — the same shape React Router detail
  pages already reach for, no new data-fetching library required for v2.0's scope.
  - This is exactly the kind of change Phase 6's "loading states" polish item formalizes into a shared pattern —
    the two phases are complementary; Phase 5 is *when* it becomes necessary, Phase 6 is *making it consistent*.
- Pages that currently import a whole array for `.map()` (`grades`, `students`, etc.) switch to an `await
  getAll()` call in the same `useEffect`, rendering a skeleton/empty state until it resolves.
- No global data-fetching/cache library (React Query, SWR, etc.) is mandated by this document — it is called out
  in Phase 6 as an option worth evaluating once real network latency exists, not a Phase 5 requirement.

### 5.5 Authentication and persistence

- `context/AuthContext.tsx` and `services/supabase.ts` already exist and already handle account sign-in and
  cloud-save sync for `Character` — Phase 5 does not introduce a second auth system for Professor/Admin. The
  `role` claim named as a seam in Phase 3.7 is where Professor/Admin sign-in hooks into the *same* `AuthContext`.
- `GameContext.tsx`'s existing debounced Supabase sync for `Character` is the precedent for how
  `ProfessorProfile`/`TeachingCourse`/Admin data would eventually persist real writes (Phase 3/4's currently-seeded
  "canonical owner" data) — this document does not change `GameContext.tsx` itself; a parallel, equally-scoped
  context (or repository-level writes with no client-side reducer at all, since Professor/Admin portals have no
  `GameContext` today) is the natural extension, decided when Phase 5 actually reaches those domains.

### 5.6 Explicit non-goals

- No migration of `Character`/`GameContext` itself — it already has its own working Supabase sync; Phase 5 is
  about the many `data/*.ts` domains that currently have none.
- No new authentication system — extends `AuthContext`, does not replace it.
- No mandated state-management/query library — left as an implementer choice once real latency is felt.
- No schema design deliverable in this document (table names, columns, RLS policies) — that is the natural next
  document once a domain is chosen to migrate first; this section defines the *pattern*, not the schema.

### 5.7 Files

Additive per domain, no deletions until Step B: `repositories/<domain>Repository.ts` (new, one per migrated
domain), `data/<domain>.ts` (modified — same exports, async bodies), the small number of pages that need a loading
state (modified). `types/` files: untouched. `GameContext.tsx`: untouched.

---

## Phase 6 — Polish

Applied last, across whatever exists by then (v1.0 Student Portal + Phases 2–5). Each item below is scoped to
"bring existing surfaces up to a consistent bar," not "add new features."

- **Responsive refinements** — audit the `max-w-3xl`/`max-w-4xl` page-shell convention across all three portals'
  pages at narrow widths (the two-portal expansion roughly triples the number of pages using
  `ProfileSection`/`ProfileField` grids that need a mobile-column check).
- **Accessibility** — keyboard navigation through `Sidebar`/`BottomNav`/`AdminDataTable`, focus states on
  `Button`/`NavLink`, color-contrast pass on the house-color and status-badge inline-style patterns
  (`ROOM_STATUS_COLORS`-style dynamic colors are the highest-risk spot, since they're hex math rather than
  Tailwind-audited utility classes), `aria-label`s on icon-only nav affordances.
- **Animations** — consistent transition timing for route changes and card reveals, reusing whatever
  motion primitives (if any) v1.0 already established rather than introducing a second animation library.
- **Loading states** — the shared pattern Phase 5 made necessary (5.4) gets formalized into a small reusable
  `components/ui/LoadingState.tsx` (skeleton or spinner) so every migrated page renders the same "waiting on the
  network" affordance instead of each page inventing its own.
- **Error boundaries** — a route-level error boundary per portal layout (`GameLayout`, `ProfessorLayout`,
  `AdminLayout`), so a failed repository call in Phase 5 degrades to a friendly in-world message ("The owls seem
  to have lost this message...") rather than a blank screen — consistent with "Portal First, Magical Second": the
  error state is still in-voice, but its job is a real portal's job (tell the user something failed and how to
  retry).
- **Testing** — component/unit tests for the pure functions this roadmap adds the most of (`utils/grades.ts`
  additions, `adminAggregates.ts`, repository implementations against a mocked Supabase client), plus smoke tests
  per portal's routing (each `NavItem.path` resolves to a rendered page, no 404s from a typo).
- **Documentation** — this document itself becomes the living index; each phase's own "Files" table is the
  starting point for a per-phase `docs/` note once that phase actually ships, the same way `CLAUDE.md` narrates
  each shipped milestone's real decisions today.
- **Deployment** — CI check for `oxlint`/`tsc` across all three portals' folders, and a Supabase migration-review
  step once Phase 5 introduces real schema changes, gating deploys the same way any additive schema change should.

---

## 7. Summary Table — What Changes Where

| Phase | New top-level folders | New nav role | New route group | Writes to frozen v1.0 files? |
|---|---|---|---|---|
| 2 | — | — | — | Additive reads only (Dashboard, Planner, Owl Post seeds) |
| 3 | `pages/professor/`, `components/professor/` | `professor` | `<ProfessorLayout />` | One optional prop on `Sidebar`/`BottomNav` |
| 4 | `pages/admin/`, `components/admin/` | `admin` | `<AdminLayout />` | None beyond `navItems.ts`/`App.tsx` registration |
| 5 | `repositories/` | — | — | `data/*.ts` bodies (signatures preserved) |
| 6 | — | — | — | Cross-cutting, additive (error boundaries, loading states) |

## 8. Non-Goals of This Entire Document

- No code is written or modified as part of producing this roadmap.
- No phase merges Student, Professor, or Admin portals into one navigation, one layout, or one data model.
- No phase assumes a specific backend vendor beyond continuing to use the Supabase integration already present in
  `services/supabase.ts` — Phase 5 names it because it's what's already there, not because this document mandates
  it over an alternative.
- No phase is a prerequisite for the others to be *designed* (they're written independently above); the
  recommended *build* order in Section 2 is a recommendation, not a hard dependency, except Phase 5 on 2–4 and
  Phase 6 on everything.
