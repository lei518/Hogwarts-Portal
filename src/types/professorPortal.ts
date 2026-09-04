import type { Assignment } from "./academics";

// Professor Portal Foundation - standalone module, seeded data only, see
// CLAUDE.md's Professor Portal section. Five independent interfaces, each
// its own canonical shape - no nested mega-object, same pattern as
// types/studentServices.ts.
//
// Authentication Foundation (Phase 6B): TeachingCourse, OfficeHour, and
// ProfessorAnnouncement now carry `professorId`, resolving the "future
// work" this file's own comment used to defer. StudentRosterEntry
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

export interface StudentRosterEntry {
  id: string;
  studentName: string;
  house: string;
  year: number;
  teachingCourseId: string;
  standing: RosterStanding;
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

export type ProfessorAnnouncementAudience = "All My Students" | "Specific Course";

export interface ProfessorAnnouncement {
  id: string;
  professorId: string; // references ProfessorProfile.id
  title: string;
  body: string;
  audience: ProfessorAnnouncementAudience;
  teachingCourseId?: string; // set when audience is "Specific Course"
  postedAt: string; // ISO date
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

export type SubmissionStatus = "Pending" | "Reviewed" | "Returned";

export interface SubmissionGrade {
  score: number;
  maxScore: number;
}

// Grade Management (Phase 3C) - a standalone grading workspace, entirely
// separate from the Student Portal's GradeRecord (types/grades.ts,
// data/grades.ts). A StudentSubmission is professor-side only: it never
// writes to Character or data/grades.ts, and nothing here is read by the
// Student Portal's Grades/Transcript/Academic Standing/Semester Summary
// pages. See context/ProfessorGradesContext for the local, in-memory state
// this type seeds.
export interface StudentSubmission {
  id: string;
  managedAssignmentId: string; // references ManagedAssignment.id
  studentId: string; // references StudentRosterEntry.id
  studentName: string;
  submittedAt: string; // ISO date
  status: SubmissionStatus;
  grade?: SubmissionGrade;
  feedback?: string;
}
