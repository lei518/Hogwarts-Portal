import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AssignmentStatus, ManagedAssignment } from "../types/professorPortal";
import { managedAssignmentsRepository } from "../repositories/managedAssignmentsRepository";
import { enrollmentsRepository } from "../repositories/enrollmentsRepository";
import { useOwlery } from "./OwleryContext";

// Assignment Management (Phase 3B) - a local, in-memory working copy for
// the Professor Portal's editor. Deliberately its own Context, separate
// from GameContext: this is professor-authored data with no Character
// dependency, and "read/write locally" here means React state that resets
// on reload, not a reducer action or a backend. Mounted once by
// ProfessorLayout so every Assignment Management page shares the same
// session-local state.
//
// Phase 5B: the initial seed now comes through managedAssignmentsRepository's
// real (Promise-based) interface, fetched once on mount - `loading` is true
// only for that first, near-instant round trip (the repository still just
// wraps today's seed array; nothing here is a real network call yet). Once
// loaded, every create/update/status change stays exactly as it was:
// synchronous local `setState`, never re-fetched.
interface ProfessorAssignmentsContextValue {
  assignments: ManagedAssignment[];
  loading: boolean;
  getManagedAssignment: (id: string) => ManagedAssignment | undefined;
  getAssignmentsForTeachingCourse: (teachingCourseId: string) => ManagedAssignment[];
  // Phase 7A - genuine writes to the live `assignments` table (see
  // repositories/managedAssignmentsRepository.ts), so a Published
  // assignment reaches a different signed-in student's session - not just
  // local state that resets on reload. `professorUserId` is required
  // because the row needs it for its RLS check; the caller (AssignmentEditorPage)
  // already has it via useProfessorScope().professorId.
  createAssignment: (
    professorUserId: string,
    input: Omit<ManagedAssignment, "id" | "status">
  ) => Promise<ManagedAssignment>;
  updateAssignment: (id: string, updates: Partial<Omit<ManagedAssignment, "id">>) => Promise<void>;
  setStatus: (id: string, status: AssignmentStatus) => Promise<void>;
}

const ProfessorAssignmentsContext = createContext<ProfessorAssignmentsContextValue | undefined>(undefined);

export function ProfessorAssignmentsProvider({ children }: { children: ReactNode }) {
  const { send } = useOwlery();
  const [assignments, setAssignments] = useState<ManagedAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    managedAssignmentsRepository.getAll().then((seeded) => {
      if (!cancelled) {
        setAssignments(seeded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function getManagedAssignment(id: string): ManagedAssignment | undefined {
    return assignments.find((assignment) => assignment.id === id);
  }

  function getAssignmentsForTeachingCourse(teachingCourseId: string): ManagedAssignment[] {
    return assignments.filter((assignment) => assignment.teachingCourseId === teachingCourseId);
  }

  async function createAssignment(
    professorUserId: string,
    input: Omit<ManagedAssignment, "id" | "status">
  ): Promise<ManagedAssignment> {
    const created = await managedAssignmentsRepository.create(professorUserId, input);
    setAssignments((prev) => [created, ...prev]);
    return created;
  }

  async function updateAssignment(id: string, updates: Partial<Omit<ManagedAssignment, "id">>): Promise<void> {
    const updated = await managedAssignmentsRepository.update(id, updates);
    setAssignments((prev) => prev.map((assignment) => (assignment.id === id ? updated : assignment)));
  }

  // Phase 5 - Owlery: publishing an assignment now fans out a real
  // Assignment Notification to every student enrolled in that course
  // (course_enrollments), since a professor's own action now genuinely
  // reaches a different signed-in student's inbox.
  async function setStatus(id: string, status: AssignmentStatus): Promise<void> {
    await updateAssignment(id, { status });
    if (status !== "Published") return;

    const assignment = assignments.find((a) => a.id === id);
    if (!assignment) return;

    const enrollments = await enrollmentsRepository.getAll();
    const enrolledStudentIds = enrollments
      .filter((e) => e.courseId === assignment.teachingCourseId)
      .map((e) => e.studentUserId);

    await Promise.all(
      enrolledStudentIds.map((studentUserId) =>
        send({
          receiverId: studentUserId,
          subject: `New Assignment: ${assignment.title}`,
          content: `${assignment.description} Due ${assignment.dueDate}.`,
          messageType: "Assignment Notification",
          relatedService: "assignments",
          relatedId: assignment.id,
        })
      )
    );
  }

  return (
    <ProfessorAssignmentsContext.Provider
      value={{
        assignments,
        loading,
        getManagedAssignment,
        getAssignmentsForTeachingCourse,
        createAssignment,
        updateAssignment,
        setStatus,
      }}
    >
      {children}
    </ProfessorAssignmentsContext.Provider>
  );
}

export function useProfessorAssignments(): ProfessorAssignmentsContextValue {
  const context = useContext(ProfessorAssignmentsContext);
  if (!context) {
    throw new Error("useProfessorAssignments must be used within a ProfessorAssignmentsProvider");
  }
  return context;
}
