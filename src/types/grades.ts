// Grades & Academic Records. Phase 2 collapsed five pages
// (Courses/Grades/Academic Progress/Semester Summary/Academic Standing/
// Transcript) into two: Grades (the working record) and Transcript (the
// official one) - see CLAUDE.md's Academics section and the Phase 2 plan.

export type GradeStatus = "In Progress" | "Completed" | "Incomplete";

// A course's current grade - computed, not stored (see
// utils/grades.ts's getCourseGrade): the average of a student's graded
// assignment_submissions for that course's assignments. "Incomplete" when
// nothing has been graded yet, never a fabricated grade.
export interface GradeRecord {
  id: string;
  courseId: string;
  currentGrade: string; // letter grade, e.g. "A-", or "Incomplete"
  percentage?: number; // 0-100, optional finer-grained score behind the letter
  status: GradeStatus;
  remarks: string;
}

export interface TranscriptEntry {
  courseId: string;
  finalGrade: string;
  credits: string; // placeholder display value - no credit system exists yet
}

// Grouped by academic year (Course.requiredYear), oldest first - the
// Transcript's own "academic history" structure.
export interface TranscriptYearGroup {
  year: number;
  entries: TranscriptEntry[];
}

export interface TranscriptRecord {
  yearGroups: TranscriptYearGroup[];
  gpa: string; // placeholder display value - no GPA scale exists yet
}

export type AcademicStandingLevel = "Good Standing" | "Honor Roll" | "Probation" | "Not Yet Determined";

// Grades' own header summary - what Academic Progress/Academic Standing/
// Semester Summary used to show as three separate pages, per Phase 2's
// consolidation.
export interface AcademicSummary {
  standing: AcademicStandingLevel;
  currentSemester: string;
  coursesCompleted: number;
  coursesInProgress: number;
  assignmentsSubmitted: number;
  housePointsEarnedThroughAcademics: number;
}
