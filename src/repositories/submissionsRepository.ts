import type { SubmissionsRepository } from "./interfaces/repositoryTypes";
import type { Submission } from "../types/academics";
import {
  listSubmissions,
  createSubmission,
  gradeSubmission,
  type SubmissionRow,
} from "../services/supabase";

function toSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    assignmentId: row.assignmentId,
    studentUserId: row.studentUserId,
    submissionText: row.submissionText,
    submittedAt: row.submittedAt,
    status: row.status,
    score: row.score ?? undefined,
    maxScore: row.maxScore ?? undefined,
    feedback: row.feedback ?? undefined,
    gradedBy: row.gradedBy ?? undefined,
    gradedAt: row.gradedAt ?? undefined,
  };
}

// Phase 2 - Real Academic Workflow. Backed by the live `assignment_submissions`
// table - RLS scopes getAll() correctly for whoever's calling it (a
// student's own rows; a professor's/admin's gradeable rows), so this one
// repository serves both the Student Portal and Professor Portal, see
// services/supabase.ts's own comment.
export const submissionsRepository: SubmissionsRepository = {
  getAll: async (): Promise<Submission[]> => (await listSubmissions()).map(toSubmission),

  // `dueDate` is the assignment's own due date (already in the caller's
  // hands) - status is computed once, here, by comparing against it; never
  // re-derived later.
  submit: async (input: {
    assignmentId: string;
    studentUserId: string;
    submissionText: string;
    dueDate: string;
  }): Promise<Submission> => {
    const isLate = new Date() > new Date(`${input.dueDate}T23:59:59`);
    const row = await createSubmission({
      assignmentId: input.assignmentId,
      studentUserId: input.studentUserId,
      submissionText: input.submissionText,
      status: isLate ? "Late" : "Submitted",
    });
    return toSubmission(row);
  },

  grade: async (
    id: string,
    input: { score: number; maxScore: number; feedback: string; gradedBy: string }
  ): Promise<Submission> => toSubmission(await gradeSubmission(id, input)),
};
