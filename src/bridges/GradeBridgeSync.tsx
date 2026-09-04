import { useEffect } from "react";
import { useGame } from "../context/GameContext";
import { useProfessorGrades } from "../context/ProfessorGradesContext";
import { useProfessorAssignments } from "../context/ProfessorAssignmentsContext";
// Phase 5B: unlike the plain utility functions elsewhere in this bridge
// layer, this component already runs inside a useEffect - it can genuinely
// await the repository layer's real (Promise-based) interface without any
// page needing to change, so it does not need the transitional sync
// accessor other consumers use.
import { professorPortalRepository } from "../repositories/professorPortalRepository";
import { assignmentsRepository } from "../repositories/assignmentsRepository";
import { getFullName } from "../utils/character";
import { percentageToLetter } from "../utils/grades";
import { findGradeBridgeMatches } from "./gradeBridge";
import { setBridgedCourseGrades, type BridgedCourseGrade } from "./gradeRecordBridge";

// Phase 3D - Grade Management Bridge. The only component that writes across
// the Professor Portal / Student Portal boundary. For every StudentSubmission
// confidently matched to the signed-in Character (see gradeBridge.ts's
// name-match rule, the sole correspondence rule - no id is invented):
//   - Milestone B: dispatches APPLY_PROFESSOR_GRADE (Character's own
//     AssignmentSubmission.grade/status - idempotent, GameContext's reducer
//     no-ops once already "Graded").
//   - Milestone C: mirrors a per-course average into the plain snapshot
//     data/grades.ts reads (bridges/gradeRecordBridge.ts).
//   - Milestone E: sends an Owl Post notification via the existing
//     SEND_OWL_POST_MESSAGE action, idempotent by a stable id, exactly like
//     data/owlPostSeeds.ts's own seeding pattern.
// No match ever means no action - a normal, silent, expected outcome.
export function GradeBridgeSync() {
  const { state, dispatch } = useGame();
  const { submissions } = useProfessorGrades();
  const { getManagedAssignment } = useProfessorAssignments();
  const character = state.character;

  useEffect(() => {
    if (!character) {
      setBridgedCourseGrades({});
      return;
    }

    let cancelled = false;

    async function syncGrades() {
      if (!character) return;
      const matches = findGradeBridgeMatches(getFullName(character), submissions);

      const bridgedCourseGrades: Record<string, BridgedCourseGrade> = {};
      const percentagesByCourse: Record<string, number[]> = {};

      for (const match of matches) {
        dispatch({
          type: "APPLY_PROFESSOR_GRADE",
          payload: { assignmentId: match.assignmentId, grade: match.score },
        });

        const [assignment, professor] = await Promise.all([
          assignmentsRepository.getById(match.assignmentId),
          professorPortalRepository.getProfile(),
        ]);
        dispatch({
          type: "SEND_OWL_POST_MESSAGE",
          payload: {
            id: `grade-notice:${match.assignmentId}`,
            category: "Professors",
            sender: professor.displayName,
            subject: `"${assignment?.title ?? "Your Assignment"}" Graded`,
            body: `${professor.displayName} has graded your submission for "${assignment?.title ?? "your assignment"}": ${match.score}/${match.maxScore}.${
              match.feedback ? ` "${match.feedback}"` : ""
            }`,
          },
        });

        const managedAssignment = getManagedAssignment(match.managedAssignmentId);
        const teachingCourse = managedAssignment
          ? await professorPortalRepository.getTeachingCourseById(managedAssignment.teachingCourseId)
          : undefined;
        if (teachingCourse) {
          const percentage = (match.score / match.maxScore) * 100;
          (percentagesByCourse[teachingCourse.courseId] ??= []).push(percentage);
        }
      }

      for (const [courseId, percentages] of Object.entries(percentagesByCourse)) {
        const average = Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length);
        bridgedCourseGrades[courseId] = { currentGrade: percentageToLetter(average), percentage: average };
      }

      if (!cancelled) setBridgedCourseGrades(bridgedCourseGrades);
    }

    void syncGrades();
    return () => {
      cancelled = true;
    };
  }, [character, submissions, dispatch, getManagedAssignment]);

  return null;
}
