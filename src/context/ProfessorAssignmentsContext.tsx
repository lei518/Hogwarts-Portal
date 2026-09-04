import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AssignmentStatus, ManagedAssignment } from "../types/professorPortal";
import { managedAssignmentsRepository } from "../repositories/managedAssignmentsRepository";

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
  createAssignment: (input: Omit<ManagedAssignment, "id" | "status">) => ManagedAssignment;
  updateAssignment: (id: string, updates: Partial<Omit<ManagedAssignment, "id">>) => void;
  setStatus: (id: string, status: AssignmentStatus) => void;
}

const ProfessorAssignmentsContext = createContext<ProfessorAssignmentsContextValue | undefined>(undefined);

export function ProfessorAssignmentsProvider({ children }: { children: ReactNode }) {
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

  function createAssignment(input: Omit<ManagedAssignment, "id" | "status">): ManagedAssignment {
    const created: ManagedAssignment = { ...input, id: crypto.randomUUID(), status: "Draft" };
    setAssignments((prev) => [created, ...prev]);
    return created;
  }

  function updateAssignment(id: string, updates: Partial<Omit<ManagedAssignment, "id">>) {
    setAssignments((prev) =>
      prev.map((assignment) => (assignment.id === id ? { ...assignment, ...updates } : assignment))
    );
  }

  function setStatus(id: string, status: AssignmentStatus) {
    updateAssignment(id, { status });
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
