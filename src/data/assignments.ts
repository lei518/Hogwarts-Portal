import type { Assignment } from "../types/academics";

// Phase 7A - Live Academic Data. No seeded assignments anymore - every
// Assignment now comes from a real professor publishing one through the
// Professor Portal, persisted to Supabase (see
// repositories/assignmentsRepository.ts). This file stays a thin,
// synchronous read cache so callers several layers below a page's render
// body (GameContext's SUBMIT_ASSIGNMENT reducer - reducers can't be async -
// and a handful of Student pages) keep reading synchronously without every
// one of them becoming async. Kept in sync by <AcademicDataSync/>, mounted
// once at the app root (see context/AcademicDataContext.tsx) - the same
// "Phase 5B sync accessor" precedent already used elsewhere in this
// codebase, just pointed at Supabase instead of a seed array. An empty
// cache is a normal, honest state (no assignments published yet), not an
// error.
let liveAssignments: Assignment[] = [];

export function setLiveAssignments(next: Assignment[]): void {
  liveAssignments = next;
}

export function getAllAssignments(): Assignment[] {
  return liveAssignments;
}

export function getAssignment(id: string): Assignment | undefined {
  return liveAssignments.find((assignment) => assignment.id === id);
}

export function getAssignmentsForCourse(courseId: string): Assignment[] {
  return liveAssignments.filter((assignment) => assignment.courseId === courseId);
}
