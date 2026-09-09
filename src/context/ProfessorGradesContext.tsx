import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Submission } from "../types/academics";
import { submissionsRepository } from "../repositories/submissionsRepository";
import { useAuth } from "./AuthContext";
import { useOwlery } from "./OwleryContext";

// Phase 2 - Real Academic Workflow. Backed by the live
// `assignment_submissions` table (see repositories/submissionsRepository.ts) -
// RLS scopes getAll() to exactly the submissions the signed-in professor
// can grade, so no client-side filtering by professor happens here (that
// scoping down to *this professor's own* teaching courses/sections still
// happens in utils/professorScope.ts, unchanged). `grade` is the one write
// action: it sets score/maxScore/feedback and moves status to "Graded" in
// one atomic update - there's no separate "mark reviewed"/"return to
// student" step, since the real state model is just
// Submitted/Late/Graded.
interface ProfessorGradesContextValue {
  submissions: Submission[];
  loading: boolean;
  getSubmission: (id: string) => Submission | undefined;
  getSubmissionsForAssignment: (assignmentId: string) => Submission[];
  // `assignmentTitle` is optional context the caller already has on hand
  // (see ProfessorSubmissionDetail.tsx) - used only to name the Grade
  // Notification sent to the student; grading itself doesn't need it.
  grade: (
    id: string,
    input: { score: number; maxScore: number; feedback: string },
    assignmentTitle?: string
  ) => Promise<void>;
  refresh: () => void;
}

const ProfessorGradesContext = createContext<ProfessorGradesContextValue | undefined>(undefined);

export function ProfessorGradesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { send } = useOwlery();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    submissionsRepository.getAll().then((loaded) => {
      if (!cancelled) {
        setSubmissions(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  function getSubmission(id: string): Submission | undefined {
    return submissions.find((submission) => submission.id === id);
  }

  function getSubmissionsForAssignment(assignmentId: string): Submission[] {
    return submissions.filter((submission) => submission.assignmentId === assignmentId);
  }

  async function grade(
    id: string,
    input: { score: number; maxScore: number; feedback: string },
    assignmentTitle?: string
  ): Promise<void> {
    if (!user) return;
    const updated = await submissionsRepository.grade(id, { ...input, gradedBy: user.id });
    setSubmissions((prev) => prev.map((submission) => (submission.id === id ? updated : submission)));

    // Phase 5 - Owlery: a real Grade Notification now that grading is a
    // genuine cross-account write, not local-only state.
    const title = assignmentTitle ?? "your assignment";
    await send({
      receiverId: updated.studentUserId,
      subject: `Grade Posted: ${title}`,
      content: `Your submission for "${title}" has been graded: ${input.score}/${input.maxScore}.${
        input.feedback ? ` Feedback: ${input.feedback}` : ""
      }`,
      messageType: "Grade Notification",
      relatedService: "grades",
      relatedId: updated.id,
    });
  }

  return (
    <ProfessorGradesContext.Provider
      value={{
        submissions,
        loading,
        getSubmission,
        getSubmissionsForAssignment,
        grade,
        refresh: () => setRefreshToken((token) => token + 1),
      }}
    >
      {children}
    </ProfessorGradesContext.Provider>
  );
}

export function useProfessorGrades(): ProfessorGradesContextValue {
  const context = useContext(ProfessorGradesContext);
  if (!context) {
    throw new Error("useProfessorGrades must be used within a ProfessorGradesProvider");
  }
  return context;
}
