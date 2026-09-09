import { useEffect, useMemo, useState } from "react";
import type {
  ManagedAssignment,
  OfficeHour,
  ProfessorProfile,
  StudentRosterEntry,
  TeachingCourse,
} from "../types/professorPortal";
import type { Submission } from "../types/academics";
import { useAuthenticatedProfessor } from "../context/AuthenticatedProfessorContext";
import { useProfessorAssignments } from "../context/ProfessorAssignmentsContext";
import { useProfessorGrades } from "../context/ProfessorGradesContext";
import { professorPortalRepository } from "../repositories/professorPortalRepository";

export interface ProfessorScope {
  professorId: string | null;
  profile: ProfessorProfile | null;
  teachingCourses: TeachingCourse[];
  teachingCoursesById: Map<string, TeachingCourse>;
  rosterByTeachingCourseId: Map<string, StudentRosterEntry[]>;
  // Phase 2 - every enrolled student across this professor's teaching
  // courses, keyed by their real Supabase user id - resolves a Submission's
  // studentUserId to a display name/house/year without a second lookup.
  studentsById: Map<string, StudentRosterEntry>;
  officeHours: OfficeHour[];
  assignments: ManagedAssignment[];
  submissions: Submission[];
  loading: boolean;
  refresh: () => void;
}

// Authentication Foundation (Phase 6B) - the one hook every Professor page
// goes through instead of importing data/professorPortal.ts or calling
// professorPortalRepository directly (mirrors utils/adminAnalytics.ts's
// useAdminAnalytics(), the same "one read-only helper, not scattered
// lookups" shape). Owns no state of its own beyond its own fetch: identity
// comes from AuthenticatedProfessorContext, assignment/submission data
// comes from ProfessorAssignmentsContext/ProfessorGradesContext exactly as
// before (see their own comments - unchanged), and this hook's only job is
// to (a) fetch the authenticated professor's own teaching
// courses/roster/office hours, and (b) filter the *existing*
// assignments/submissions down to the ones taught in one of those
// teaching courses. No new source of truth is introduced - everything
// here is either a repository read or a derived filter. Announcements
// (Phase 6) are no longer fetched here - Professor pages read
// useAcademicData().announcements directly, filtered by authorUserId,
// the same global source every other role reads from.
export function useProfessorScope(): ProfessorScope {
  const { professorId, profile, loading: identityLoading, refresh: refreshIdentity } = useAuthenticatedProfessor();
  const { assignments: allAssignments, loading: assignmentsLoading } = useProfessorAssignments();
  const { submissions: allSubmissions, loading: gradesLoading } = useProfessorGrades();

  const [teachingCourses, setTeachingCourses] = useState<TeachingCourse[]>([]);
  const [rosterByTeachingCourseId, setRosterByTeachingCourseId] = useState<Map<string, StudentRosterEntry[]>>(
    new Map()
  );
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [scopeLoading, setScopeLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (identityLoading) return;

    if (!professorId) {
      setTeachingCourses([]);
      setRosterByTeachingCourseId(new Map());
      setOfficeHours([]);
      setScopeLoading(false);
      return;
    }

    let cancelled = false;
    setScopeLoading(true);

    async function loadScope() {
      const [courses, hours] = await Promise.all([
        professorPortalRepository.getTeachingCoursesForProfessor(professorId!),
        professorPortalRepository.getOfficeHoursForProfessor(professorId!),
      ]);
      if (cancelled) return;

      const rosterEntries = await Promise.all(
        courses.map((course) => professorPortalRepository.getRosterForTeachingCourse(course.id))
      );
      if (cancelled) return;

      setTeachingCourses(courses);
      setOfficeHours(hours);
      setRosterByTeachingCourseId(new Map(courses.map((course, index) => [course.id, rosterEntries[index]])));
      setScopeLoading(false);
    }

    loadScope();
    return () => {
      cancelled = true;
    };
  }, [professorId, identityLoading, refreshToken]);

  const teachingCoursesById = useMemo(() => new Map(teachingCourses.map((c) => [c.id, c])), [teachingCourses]);

  const studentsById = useMemo(() => {
    const map = new Map<string, StudentRosterEntry>();
    for (const roster of rosterByTeachingCourseId.values()) {
      for (const entry of roster) map.set(entry.studentUserId, entry);
    }
    return map;
  }, [rosterByTeachingCourseId]);

  const assignments = useMemo(
    () => allAssignments.filter((assignment) => teachingCoursesById.has(assignment.teachingCourseId)),
    [allAssignments, teachingCoursesById]
  );

  const assignmentIds = useMemo(() => new Set(assignments.map((assignment) => assignment.id)), [assignments]);

  const submissions = useMemo(
    () => allSubmissions.filter((submission) => assignmentIds.has(submission.assignmentId)),
    [allSubmissions, assignmentIds]
  );

  return {
    professorId,
    profile,
    teachingCourses,
    teachingCoursesById,
    rosterByTeachingCourseId,
    studentsById,
    officeHours,
    assignments,
    submissions,
    loading: identityLoading || scopeLoading || assignmentsLoading || gradesLoading,
    refresh: () => {
      refreshIdentity();
      setRefreshToken((token) => token + 1);
    },
  };
}
