import type { Submission } from "../types/academics";

// Grade Management - shared by the Grade Dashboard and My Courses, both of
// which show an "Average Grade" over a set of submissions. Pure, local
// computation only.
export function getAveragePercentage(submissions: Submission[]): number | null {
  const graded = submissions.filter(
    (submission) => submission.status === "Graded" && submission.score !== undefined && submission.maxScore
  );
  if (graded.length === 0) return null;

  const total = graded.reduce((sum, submission) => sum + (submission.score! / submission.maxScore!) * 100, 0);

  return Math.round(total / graded.length);
}
