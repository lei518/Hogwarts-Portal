// Academics foundation - see CLAUDE.md's Academics section. Each interface
// is independent on purpose so a future milestone (Assignments, Exams,
// Attendance, Grades) can extend one without reshaping the others.

// The canonical home for a Hogwarts course - Charms, Potions, etc. Fields
// marked "future" exist now so the model doesn't need reshaping when the
// system behind them is built; nothing populates them yet.
export interface Course {
  id: string;
  name: string;
  // Phase 7A - Live Academic Data. No longer a hardcoded seed value: this is
  // resolved at read time from the live course_professor_assignments table
  // (see repositories/coursesRepository.ts) - null means "To Be Assigned",
  // never a fabricated professor.
  professorId: string | null;
  classroom: string;
  description: string;
  requiredYear: number;
  housePointsAvailable?: number; // future - Assignments/Grades will populate this
  relatedSpellIds?: string[]; // future - links into data/spells.ts
  // One-directional on purpose: Course points at Library resources: Library
  // itself has no knowledge of Courses (see data/books.ts).
  recommendedBookIds?: string[];
}

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface ScheduleEntry {
  id: string;
  courseId: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM", 24h
  endTime: string;
}

export type AcademicProgressStatus = "Not Started" | "In Progress" | "Completed";

// Phase 7A - Assignments/Quizzes/Exams are all the same shared shape; only
// the label differs, so this doesn't need three separate types.
export type AssignmentItemType = "Assignment" | "Quiz" | "Exam";

// The canonical academic-work model, shared by the Student Portal and the
// Professor Portal - both read the same live `assignments` table (see
// repositories/assignmentsRepository.ts). Submission is the per-student
// record of doing it (see below) - Phase 2 moved this off Character and
// into its own live, cross-user-visible table, since a professor grading
// it needs to see it too.
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string; // ISO "YYYY-MM-DD"
  requiredYear: number;
  itemType: AssignmentItemType;
  housePointsReward?: number; // optional - awarded once on submission
  maxGrade?: number; // future - Professor Portal grading
}

// Phase 2 - Real Academic Workflow. A row only ever exists once a student
// has actually submitted something - "Not Submitted" is the absence of a
// Submission, never a fabricated placeholder row (see
// repositories/submissionsRepository.ts, backed by the live
// `assignment_submissions` table). `status` starts as "Submitted" or
// "Late" (computed once, at submit time, against the assignment's due
// date) and becomes "Graded" once a professor grades it.
export type SubmissionStatus = "Submitted" | "Late" | "Graded";

// The display-only status a student-facing page shows, which does include
// the no-row case - never persisted as a Submission's own `status`.
export type AssignmentDisplayStatus = "Not Submitted" | SubmissionStatus;

export interface Submission {
  id: string;
  assignmentId: string;
  studentUserId: string;
  submissionText: string;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  maxScore?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}
