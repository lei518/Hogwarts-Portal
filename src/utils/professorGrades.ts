import type { StudentSubmission } from "../types/professorPortal";

// Grade Management (Phase 3C) - shared by the Grade Dashboard and My
// Courses, both of which show an "Average Grade" over a set of
// submissions. Pure, local computation only - no Student Portal
// involvement, no data/grades.ts.
export function getAveragePercentage(submissions: StudentSubmission[]): number | null {
  const graded = submissions.filter((submission) => submission.grade !== undefined);
  if (graded.length === 0) return null;

  const total = graded.reduce((sum, submission) => {
    const grade = submission.grade!;
    return sum + (grade.score / grade.maxScore) * 100;
  }, 0);

  return Math.round(total / graded.length);
}
