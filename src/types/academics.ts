// Academics foundation - see CLAUDE.md's Academics section. Each interface
// is independent on purpose so a future milestone (Assignments, Exams,
// Attendance, Grades) can extend one without reshaping the others.

// The canonical home for a Hogwarts course - Charms, Potions, etc. Fields
// marked "future" exist now so the model doesn't need reshaping when the
// system behind them is built; nothing populates them yet.
export interface Course {
  id: string;
  name: string;
  professorId: string; // references data/professors.ts - Course never duplicates the name
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

// The canonical academic-work model, shared by the Student Portal and the
// future Professor Portal. An Assignment is the shared, professor-authored
// definition (today seeded, later created/edited through a Professor
// Portal that writes into the same collection - see data/assignments.ts);
// AssignmentSubmission is the per-student record of doing it, which is why
// it lives on Character, not here.
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string; // ISO "YYYY-MM-DD"
  requiredYear: number;
  housePointsReward?: number; // optional - awarded once on submission
  maxGrade?: number; // future - Professor Portal grading
}

export type AssignmentStatus = "Not Started" | "Submitted" | "Graded";

export interface AssignmentSubmission {
  assignmentId: string;
  status: AssignmentStatus;
  submittedAt?: string;
  grade?: number; // future - set once Professor Portal grading exists
}
