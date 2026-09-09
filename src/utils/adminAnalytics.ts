import type { House } from "../types/game";
import type { HousePointAward } from "../types/campusLife";
import type { Announcement } from "../types/resources";
import { useGame } from "../context/GameContext";
import { useProfessorAssignments } from "../context/ProfessorAssignmentsContext";
import { useProfessorGrades } from "../context/ProfessorGradesContext";
import { useAdmin } from "../context/AdminContext";
import { useAcademicData } from "../context/AcademicDataContext";
import { getAllAssignments } from "../data/assignments";
import { getFullName } from "./character";

export interface AdminAnalyticsSnapshot {
  studentCount: number;
  professorCount: number;
  activeAccountCount: number;
  assignmentCount: number;
  publishedAssignmentCount: number;
  draftAssignmentCount: number;
  archivedAssignmentCount: number;
  pendingReviewCount: number;
  reviewedSubmissionCount: number;
  activeCharacterName: string | null;
  houseCupStandings: { house: House; points: number }[];
  recentHouseAwards: HousePointAward[];
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
  // Phase 6 - Communication & Administration System.
  announcementDraftCount: number;
  announcementPublishedCount: number;
  recentAnnouncements: Announcement[];
}

// Admin Portal Foundation - the one read-only helper every Admin page goes
// through instead of calling useGame/useProfessorAssignments/
// useProfessorGrades directly (see CLAUDE.md's Admin Portal section on
// ownership). Everything here is computed on every call, never stored -
// Analytics (and the Dashboard's summary cards, and House Cup Management)
// never become a second source of truth for any of it.
//
// House Cup standings are a disclosed simplification: this is a
// single-player portal with exactly one live Character per session, so
// "all students" here really means "whichever Character is currently
// signed in" - there is no multi-student ledger to aggregate across, the
// same limitation Professor Portal's own seeded roster already carries.
// Phase 5 - Owlery's own message counts were dropped rather than rebuilt
// as a cross-user query here (see the Phase 5 plan) - Owlery is a real
// per-account inbox now, not a single-Character quirk this module could
// meaningfully aggregate.
export function useAdminAnalytics(): AdminAnalyticsSnapshot {
  const { state } = useGame();
  const { assignments } = useProfessorAssignments();
  const { submissions } = useProfessorGrades();
  const { accounts, serviceRequests, calendarDrafts, housePointAdjustments, resourceRequests } = useAdmin();
  const { announcements } = useAcademicData();
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
  const recentAnnouncements = [...announcements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    // Phase 7A - live account counts (see AdminContext.accounts, the same
    // Supabase-backed source StudentRecords.tsx/ProfessorRecords.tsx read)
    // instead of the seeded student/professor directory arrays.
    studentCount: accounts.filter((account) => account.role === "student").length,
    professorCount: accounts.filter((account) => account.role === "professor").length,
    activeAccountCount: accounts.filter((account) => account.status === "Active").length,
    assignmentCount: getAllAssignments().length,
    publishedAssignmentCount: assignments.filter((a) => a.status === "Published").length,
    draftAssignmentCount: assignments.filter((a) => a.status === "Draft").length,
    archivedAssignmentCount: assignments.filter((a) => a.status === "Archived").length,
    pendingReviewCount: submissions.filter((s) => s.status !== "Graded").length,
    reviewedSubmissionCount: submissions.filter((s) => s.status === "Graded").length,
    activeCharacterName: character ? getFullName(character) : null,
    houseCupStandings,
    recentHouseAwards: character ? character.housePointAwards.slice(0, 5) : [],
    pendingServiceRequestCount,
    draftCalendarEventCount,
    publishedCalendarEventCount,
    outstandingResourceRequestCount,
    housePointAdjustmentCount: housePointAdjustments.length,
    housePointAdjustmentsAwaitingReviewCount,
    housePointAdjustmentNetTotal: housePointAdjustments.reduce((sum, a) => sum + a.amount, 0),
    activeAdministrativeOperationsCount:
      pendingServiceRequestCount + draftCalendarEventCount + outstandingResourceRequestCount,
    announcementDraftCount: announcements.filter((a) => !a.published).length,
    announcementPublishedCount: announcements.filter((a) => a.published).length,
    recentAnnouncements,
  };
}
