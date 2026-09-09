import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Assignment, Course, Submission } from "../types/academics";
import type { Announcement, Professor } from "../types/resources";
import { coursesRepository } from "../repositories/coursesRepository";
import { professorsRepository } from "../repositories/professorsRepository";
import { assignmentsRepository } from "../repositories/assignmentsRepository";
import { announcementsRepository } from "../repositories/announcementsRepository";
import { enrollmentsRepository } from "../repositories/enrollmentsRepository";
import { submissionsRepository } from "../repositories/submissionsRepository";
import { setLiveAssignments } from "../data/assignments";
import { setMySubmissions } from "../data/submissions";
import { useAuth } from "./AuthContext";
import { useGame } from "./GameContext";

// Phase 7A/2 - Live Academic Data. The one place Courses/Assignments/
// Announcements/Enrollments/Submissions/Professor-name-resolution are
// fetched from Supabase, once, for every portal (not just students - a
// professor/staff/admin account fetches the same courses/assignments/
// announcements here too, see Phase 6's own use of this everywhere) to
// share - mirrors AdminContext/ProfessorAssignmentsContext's own "fetch
// once on mount, expose via a hook" shape. Also mirrors the live
// `assignments`/own-`submissions` into data/assignments.ts's/
// data/submissions.ts's synchronous read caches (see those files' own
// comments) so the few callers that must stay synchronous keep working
// without becoming async - announcements never needed this (Phase 6:
// confirmed zero synchronous callers), so no cache exists for it.
//
// Phase 2 - for a signed-in student, this is also where "your year matches
// this course" becomes a real `course_enrollments` row (ensureEnrolled),
// which is what lets `assignments`/`assignment_submissions` RLS actually
// enforce enrollment server-side rather than trusting a client-side year
// check. That's why this provider now sits inside GameProvider (see
// main.tsx) - it needs the signed-in student's own Character.year.
interface AcademicDataContextValue {
  courses: Course[];
  coursesById: Map<string, Course>;
  professorsById: Map<string, Professor>;
  assignments: Assignment[];
  announcements: Announcement[];
  enrolledCourseIds: Set<string>;
  submissions: Submission[];
  loading: boolean;
  refresh: () => void;
}

const AcademicDataContext = createContext<AcademicDataContextValue | undefined>(undefined);

export function AcademicDataProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const { state } = useGame();
  const characterYear = state.character?.year;

  const [courses, setCourses] = useState<Course[]>([]);
  const [professorsById, setProfessorsById] = useState<Map<string, Professor>>(new Map());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setCourses([]);
      setProfessorsById(new Map());
      setAssignments([]);
      setAnnouncements([]);
      setEnrolledCourseIds(new Set());
      setSubmissions([]);
      setLiveAssignments([]);
      setMySubmissions([]);
      setLoading(false);
      return;
    }

    const isStudent = profile?.role === "student";
    const userId = user.id;

    let cancelled = false;
    setLoading(true);

    async function load() {
      const [loadedCourses, professors] = await Promise.all([
        coursesRepository.getAll(),
        professorsRepository.getAll(),
      ]);
      if (cancelled) return;

      // Auto-enrollment: a student's own account enrolls itself in every
      // course it's eligible for by year, idempotently, before assignments
      // (which now require a real enrollment row to be visible) are fetched.
      if (isStudent && characterYear !== undefined) {
        const eligible = loadedCourses.filter((course) => course.requiredYear <= characterYear);
        await Promise.all(eligible.map((course) => enrollmentsRepository.ensureEnrolled(course.id, userId)));
      }
      if (cancelled) return;

      const [loadedAssignments, loadedAnnouncements, loadedEnrollments, loadedSubmissions] = await Promise.all([
        assignmentsRepository.getAll(),
        announcementsRepository.getAll(),
        enrollmentsRepository.getAll(),
        isStudent ? submissionsRepository.getAll() : Promise.resolve([]),
      ]);
      if (cancelled) return;

      setCourses(loadedCourses);
      setProfessorsById(new Map(professors.map((professor) => [professor.id, professor])));
      setAssignments(loadedAssignments);
      setAnnouncements(loadedAnnouncements);
      setEnrolledCourseIds(
        new Set(loadedEnrollments.filter((row) => row.studentUserId === userId).map((row) => row.courseId))
      );
      setSubmissions(loadedSubmissions);
      setLiveAssignments(loadedAssignments);
      setMySubmissions(loadedSubmissions);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, profile?.role, authLoading, characterYear, refreshToken]);

  const coursesById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  return (
    <AcademicDataContext.Provider
      value={{
        courses,
        coursesById,
        professorsById,
        assignments,
        announcements,
        enrolledCourseIds,
        submissions,
        loading,
        refresh: () => setRefreshToken((token) => token + 1),
      }}
    >
      {children}
    </AcademicDataContext.Provider>
  );
}

export function useAcademicData(): AcademicDataContextValue {
  const context = useContext(AcademicDataContext);
  if (!context) {
    throw new Error("useAcademicData must be used within an AcademicDataProvider");
  }
  return context;
}
