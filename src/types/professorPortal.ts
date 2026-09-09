import type { Assignment } from "./academics";

// Professor Portal Foundation - standalone module, seeded data only, see
// CLAUDE.md's Professor Portal section. Five independent interfaces, each
// its own canonical shape - no nested mega-object, same pattern as
// types/studentServices.ts.
//
// Authentication Foundation (Phase 6B): TeachingCourse and OfficeHour now
// carry `professorId`, resolving the "future work" this file's own comment
// used to defer (Phase 6 - Communication & Administration System removed
// ProfessorAnnouncement entirely; Professor pages read the shared
// Announcement type from types/resources.ts instead, filtered by
// authorUserId - see utils/professorScope.ts's own comment).
// StudentRosterEntry
// deliberately does NOT get its own `professorId` - it's already scoped
// through `teachingCourseId`, and ManagedAssignment/StudentSubmission stay
// scoped the same indirect way (via their own teachingCourseId /
// managedAssignmentId chains) rather than duplicating ownership onto every
// record that's reachable from a TeachingCourse.

export interface ProfessorProfile {
  id: string; // matches an existing data/professors.ts Professor.id
  displayName: string;
  title: string;
  department: string;
  officeLocation: string;
  bio: string;
  yearsAtHogwarts: number;
}

export interface TeachingCourse {
  id: string;
  professorId: string; // references ProfessorProfile.id
  courseId: string; // references data/courses.ts Course.id, one-directional
  section: string;
  meetingPattern: string;
  enrolledStudentIds: string[];
}

export type RosterStanding = "Excelling" | "On Track" | "Needs Attention";

// Phase 7A - `standing`/`attendanceNote` are optional: a live roster entry
// (computed from real year-based enrollment, see
// repositories/professorPortalRepository.ts) has no data source for either
// - no fabricated assessment is invented on a real student's behalf.
export interface StudentRosterEntry {
  id: string;
  studentUserId: string;
  studentName: string;
  house: string;
  year: number;
  teachingCourseId: string;
  standing?: RosterStanding;
  attendanceNote?: string;
}

export type OfficeHourDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface OfficeHour {
  id: string;
  professorId: string; // references ProfessorProfile.id
  day: OfficeHourDay;
  startTime: string; // "HH:MM", 24h - matches ScheduleEntry's convention
  endTime: string;
  location: string;
  note?: string;
}

export type AssignmentStatus = "Draft" | "Published" | "Archived";

// Assignment Management (Phase 3B). Reuses the shared Assignment shape
// (title/description/dueDate/rewards) instead of redefining those fields -
// only the professor-authoring concerns are new: which section it belongs
// to, and where it stands in the authoring workflow. This is a standalone,
// locally-editable working copy (see context/ProfessorAssignmentsContext) -
// it is not data/assignments.ts, the Student Portal's canonical, read-only
// source, and nothing here writes to that collection. `courseId` and
// `requiredYear` are dropped in favor of `teachingCourseId`, since a
// managed assignment always belongs to one specific section rather than a
// whole course.
export interface ManagedAssignment extends Omit<Assignment, "courseId" | "requiredYear"> {
  teachingCourseId: string;
  status: AssignmentStatus;
}

// Phase 2 - Real Academic Workflow. Grading now reads/writes the live
// `assignment_submissions` table directly via `types/academics.ts`'s
// Submission/SubmissionStatus (Submitted/Late/Graded) - the old seeded,
// name-matched StudentSubmission/SubmissionStatus (Pending/Reviewed/
// Returned) is gone, see context/ProfessorGradesContext.tsx.
