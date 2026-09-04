import type { House } from "../types/game";
import type { HousePointAward } from "../types/campusLife";
import { useGame } from "../context/GameContext";
import { useProfessorAssignments } from "../context/ProfessorAssignmentsContext";
import { useProfessorGrades } from "../context/ProfessorGradesContext";
import { useAdmin } from "../context/AdminContext";
// Phase 5B: useAdminAnalytics is a hook called synchronously in every Admin
// page's render body - see repositories/*.ts's own comments on each
// Phase 5B transitional sync accessor.
import { studentsRepositorySync } from "../repositories/studentsRepository";
import { professorsRepositorySync } from "../repositories/professorsRepository";
import { assignmentsRepositorySync } from "../repositories/assignmentsRepository";
import { getFullName } from "./character";

export interface AdminAnalyticsSnapshot {
  studentCount: number;
  professorCount: number;
  assignmentCount: number;
  publishedAssignmentCount: number;
  draftAssignmentCount: number;
  archivedAssignmentCount: number;
  pendingReviewCount: number;
  reviewedSubmissionCount: number;
  activeCharacterName: string | null;
  houseCupStandings: { house: House; points: number }[];
  recentHouseAwards: HousePointAward[];
  owlPostTotal: number;
  owlPostUnread: number;
  // Admin Operations (Phase 4B) - AdminContext's own state, aggregated the
  // same way as everything else here: computed fresh, never stored.
  pendingServiceRequestCount: number;
  draftCalendarEventCount: number;
  publishedCalendarEventCount: number;
  outstandingResourceRequestCount: number;
  housePointAdjustmentCount: number;
  housePointAdjustmentsAwaitingReviewCount: number;
  housePointAdjustmentNetTotal: number;
  activeAdministrativeOperationsCount: number;
}

// Admin Portal Foundation - the one read-only helper every Admin page goes
// through instead of calling useGame/useProfessorAssignments/
// useProfessorGrades directly (see CLAUDE.md's Admin Portal section on
// ownership). Everything here is computed on every call, never stored -
// Analytics (and the Dashboard's summary cards, and House Cup Management)
// never become a second source of truth for any of it.
//
// House Cup standings and Owl Post statistics are a disclosed
// simplification: this is a single-player portal with exactly one live
// Character per session, so "all students" here really means "whichever
// Character is currently signed in" - there is no multi-student ledger to
// aggregate across, the same limitation Professor Portal's own seeded
// roster already carries.
export function useAdminAnalytics(): AdminAnalyticsSnapshot {
  const { state } = useGame();
  const { assignments } = useProfessorAssignments();
  const { submissions } = useProfessorGrades();
  const { serviceRequests, calendarDrafts, housePointAdjustments, resourceRequests } = useAdmin();
  const character = state.character;

  const houseCupStandings = character
    ? (Object.entries(character.housePoints) as [House, number][])
        .map(([house, points]) => ({ house, points }))
        .sort((a, b) => b.points - a.points)
    : [];

  const pendingServiceRequestCount = serviceRequests.filter((r) => r.status === "Pending").length;
  const draftCalendarEventCount = calendarDrafts.filter((d) => d.status === "Draft").length;
  const publishedCalendarEventCount = calendarDrafts.filter((d) => d.status === "Published").length;
  const outstandingResourceRequestCount = resourceRequests.filter(
    (r) => r.status === "Pending" || r.status === "Ordered"
  ).length;
  const housePointAdjustmentsAwaitingReviewCount = housePointAdjustments.filter((a) => !a.reviewed).length;

  return {
    studentCount: studentsRepositorySync.getAll().length,
    professorCount: professorsRepositorySync.getAll().length,
    assignmentCount: assignmentsRepositorySync.getAll().length,
    publishedAssignmentCount: assignments.filter((a) => a.status === "Published").length,
    draftAssignmentCount: assignments.filter((a) => a.status === "Draft").length,
    archivedAssignmentCount: assignments.filter((a) => a.status === "Archived").length,
    pendingReviewCount: submissions.filter((s) => s.status === "Pending").length,
    reviewedSubmissionCount: submissions.filter((s) => s.status !== "Pending").length,
    activeCharacterName: character ? getFullName(character) : null,
    houseCupStandings,
    recentHouseAwards: character ? character.housePointAwards.slice(0, 5) : [],
    owlPostTotal: character?.owlPost.length ?? 0,
    owlPostUnread: character?.owlPost.filter((m) => !m.read).length ?? 0,
    pendingServiceRequestCount,
    draftCalendarEventCount,
    publishedCalendarEventCount,
    outstandingResourceRequestCount,
    housePointAdjustmentCount: housePointAdjustments.length,
    housePointAdjustmentsAwaitingReviewCount,
    housePointAdjustmentNetTotal: housePointAdjustments.reduce((sum, a) => sum + a.amount, 0),
    activeAdministrativeOperationsCount:
      pendingServiceRequestCount + draftCalendarEventCount + outstandingResourceRequestCount,
  };
}
