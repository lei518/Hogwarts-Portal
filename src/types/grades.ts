// Grades & Academic Records - standalone module (see CLAUDE.md). Kept as
// independent interfaces on purpose, per this milestone's instruction not
// to nest everything into one huge object - each is a distinct future
// integration point (Professor Portal grades GradeRecord; a Dashboard
// widget previews AcademicStanding; etc.) and should be extendable alone.

export type GradeStatus = "In Progress" | "Completed" | "Incomplete";

// The canonical grade for one course. Seeded today because no professor
// can submit a real grade yet ("Do not fabricate dynamic grading logic") -
// see data/grades.ts. When a Professor Portal exists, this is the shape it
// writes into; nothing here needs to change, only where it comes from.
export interface GradeRecord {
  id: string;
  courseId: string;
  currentGrade: string; // letter grade, e.g. "A-"
  percentage?: number; // 0-100, optional finer-grained score behind the letter
  status: GradeStatus;
  remarks: string;
}

export interface TranscriptEntry {
  courseId: string;
  finalGrade: string;
  credits: string; // placeholder display value - no credit system exists yet
}

export interface TranscriptRecord {
  academicYear: string;
  semester: string;
  entries: TranscriptEntry[];
  gpa: string; // placeholder display value - no GPA scale exists yet
}

export type AcademicStandingLevel = "Good Standing" | "Honor Roll" | "Probation" | "Not Yet Determined";

export interface AcademicStanding {
  standing: AcademicStandingLevel;
  gpa: string; // placeholder
  creditsEarned: string; // placeholder
  coursesCompleted: number;
  coursesInProgress: number;
  assignmentsSubmitted: number;
  housePointsEarnedThroughAcademics: number;
}

export interface SemesterSummary {
  semester: string;
  coursesTaken: number;
  assignmentsCompleted: number;
  averageGrade: string;
  standing: AcademicStandingLevel;
  professorFeedback: string; // placeholder - no Professor Portal yet
}
