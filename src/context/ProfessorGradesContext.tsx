import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { StudentSubmission, SubmissionGrade } from "../types/professorPortal";
import { studentSubmissionsRepository } from "../repositories/studentSubmissionsRepository";

// Grade Management (Phase 3C) - a local, in-memory grading workspace,
// entirely separate from the Student Portal's GradeRecord/Character data.
// Mirrors ProfessorAssignmentsContext exactly: session-local React state,
// no reducer, no persistence, no backend. Mounted once by ProfessorLayout
// so every Grade Management page shares the same session-local state.
//
// Phase 5B: seeded through studentSubmissionsRepository's real (Promise-
// based) interface on mount - see ProfessorAssignmentsContext's own
// comment for why `loading` is brief and every later write stays
// synchronous local state.
interface ProfessorGradesContextValue {
  submissions: StudentSubmission[];
  loading: boolean;
  getSubmission: (id: string) => StudentSubmission | undefined;
  getSubmissionsForAssignment: (managedAssignmentId: string) => StudentSubmission[];
  reviewSubmission: (id: string) => void;
  setGrade: (id: string, grade: SubmissionGrade) => void;
  setFeedback: (id: string, feedback: string) => void;
  returnSubmission: (id: string) => void;
}

const ProfessorGradesContext = createContext<ProfessorGradesContextValue | undefined>(undefined);

export function ProfessorGradesProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    studentSubmissionsRepository.getAll().then((seeded) => {
      if (!cancelled) {
        setSubmissions(seeded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function getSubmission(id: string): StudentSubmission | undefined {
    return submissions.find((submission) => submission.id === id);
  }

  function getSubmissionsForAssignment(managedAssignmentId: string): StudentSubmission[] {
    return submissions.filter((submission) => submission.managedAssignmentId === managedAssignmentId);
  }

  function updateSubmission(id: string, updates: Partial<Omit<StudentSubmission, "id">>) {
    setSubmissions((prev) =>
      prev.map((submission) => (submission.id === id ? { ...submission, ...updates } : submission))
    );
  }

  function reviewSubmission(id: string) {
    updateSubmission(id, { status: "Reviewed" });
  }

  function setGrade(id: string, grade: SubmissionGrade) {
    updateSubmission(id, { grade });
  }

  function setFeedback(id: string, feedback: string) {
    updateSubmission(id, { feedback });
  }

  function returnSubmission(id: string) {
    updateSubmission(id, { status: "Returned" });
  }

  return (
    <ProfessorGradesContext.Provider
      value={{
        submissions,
        loading,
        getSubmission,
        getSubmissionsForAssignment,
        reviewSubmission,
        setGrade,
        setFeedback,
        returnSubmission,
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
