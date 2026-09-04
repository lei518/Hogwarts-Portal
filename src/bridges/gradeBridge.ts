import { useGame } from "../context/GameContext";
import { useProfessorGrades } from "../context/ProfessorGradesContext";
import { getFullName } from "../utils/character";
import { BRIDGED_ASSIGNMENT_PREFIX } from "./assignmentBridge";
import type { StudentSubmission } from "../types/professorPortal";

export interface GradeBridgeMatch {
  submissionId: string;
  managedAssignmentId: string;
  assignmentId: string; // bridged, Student-facing Assignment.id
  score: number;
  maxScore: number;
  feedback?: string;
}

// Phase 3D - Grade Management Bridge. This is the ONLY correspondence rule
// between a Professor-reviewed StudentSubmission (seeded against a fictional
// class roster, see data/professorGrades.ts) and the real, signed-in
// Character: an exact match on full name. Nothing is invented, no id is
// forced - a submission whose roster name doesn't match the Character's own
// name simply never appears here, and that is a normal, expected outcome,
// not an error. Pure and React-free so it's reused identically by
// GradeBridgeSync (which writes) and any read-only widget (which doesn't).
export function findGradeBridgeMatches(
  characterFullName: string,
  submissions: StudentSubmission[]
): GradeBridgeMatch[] {
  return submissions
    .filter((submission) => submission.status !== "Pending")
    .filter((submission): submission is StudentSubmission & { grade: NonNullable<StudentSubmission["grade"]> } =>
      submission.grade !== undefined
    )
    .filter((submission) => submission.studentName === characterFullName)
    .map((submission) => ({
      submissionId: submission.id,
      managedAssignmentId: submission.managedAssignmentId,
      assignmentId: `${BRIDGED_ASSIGNMENT_PREFIX}${submission.managedAssignmentId}`,
      score: submission.grade.score,
      maxScore: submission.grade.maxScore,
      feedback: submission.feedback,
    }));
}

// Read-only convenience for any Student Portal component (e.g. a Dashboard
// widget) that wants today's matches without duplicating the three-line
// wiring below. Returns [] whenever there's no signed-in Character.
export function useGradeBridgeMatches(): GradeBridgeMatch[] {
  const { state } = useGame();
  const { submissions } = useProfessorGrades();
  if (!state.character) return [];
  return findGradeBridgeMatches(getFullName(state.character), submissions);
}
