import type { Submission } from "../types/academics";

// Phase 2 - Real Academic Workflow. A thin, synchronous read cache of the
// SIGNED-IN STUDENT's own submissions only (never another student's) -
// kept in sync by AcademicDataContext (see that file's own comment), which
// fetches via submissionsRepository. Needed because several page render
// bodies (Courses, CourseDetail, the Planner, ...) call
// utils/academics.ts's getCourseStatus/getUpcomingAssignments
// synchronously - same "Phase 5B sync accessor" precedent as
// data/assignments.ts/data/announcements.ts. A professor's view of *other*
// students' submissions goes through submissionsRepository directly (see
// context/ProfessorGradesContext.tsx) and never touches this cache.
let mySubmissions: Submission[] = [];

export function setMySubmissions(next: Submission[]): void {
  mySubmissions = next;
}

export function getMySubmissions(): Submission[] {
  return mySubmissions;
}

export function getMySubmissionForAssignment(assignmentId: string): Submission | undefined {
  return mySubmissions.find((submission) => submission.assignmentId === assignmentId);
}
