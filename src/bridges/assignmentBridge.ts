import type { Assignment } from "../types/academics";
import type { ManagedAssignment } from "../types/professorPortal";
// Phase 5B: getBridgedAssignment(s) is called synchronously from
// data/assignments.ts, itself called directly and synchronously by several
// Student pages - see repositories/*.ts's own comments on each Phase 5B
// transitional sync accessor.
import { professorPortalRepositorySync } from "../repositories/professorPortalRepository";
import { coursesRepositorySync } from "../repositories/coursesRepository";

// Phase 3D - Published Assignment Bridge. The Student Portal continues to
// own `data/assignments.ts` and the `Assignment` type; this module only
// ADDS Published ManagedAssignments (Professor Portal, Phase 3B) into what
// a student can see, mapped into the exact same Assignment shape. Draft and
// Archived assignments are never surfaced.
//
// `data/assignments.ts`'s functions read `getBridgedAssignments()` below
// instead of importing ProfessorAssignmentsContext directly - the Student
// Portal stays unaware that context exists. The snapshot itself is kept in
// sync by <AssignmentBridgeSync/>, mounted once at the app root (see
// main.tsx), which is the only piece of this bridge that touches React
// Context - everything downstream of it (including GameContext's
// SUBMIT_ASSIGNMENT reducer case, unmodified) is a plain, synchronous read.
export const BRIDGED_ASSIGNMENT_PREFIX = "bridged:";

let publishedSnapshot: ManagedAssignment[] = [];

export function setPublishedManagedAssignments(assignments: ManagedAssignment[]): void {
  publishedSnapshot = assignments.filter((assignment) => assignment.status === "Published");
}

function toBridgedAssignment(managed: ManagedAssignment): Assignment | undefined {
  const teachingCourse = professorPortalRepositorySync.getTeachingCourseById(managed.teachingCourseId);
  if (!teachingCourse) return undefined;
  const course = coursesRepositorySync.getById(teachingCourse.courseId);

  return {
    id: `${BRIDGED_ASSIGNMENT_PREFIX}${managed.id}`,
    courseId: teachingCourse.courseId,
    title: managed.title,
    description: managed.description,
    dueDate: managed.dueDate,
    requiredYear: course?.requiredYear ?? 1,
    housePointsReward: managed.housePointsReward,
    maxGrade: managed.maxGrade,
  };
}

export function getBridgedAssignments(): Assignment[] {
  return publishedSnapshot
    .map(toBridgedAssignment)
    .filter((assignment): assignment is Assignment => assignment !== undefined);
}

export function getBridgedAssignment(id: string): Assignment | undefined {
  if (!id.startsWith(BRIDGED_ASSIGNMENT_PREFIX)) return undefined;
  const managedId = id.slice(BRIDGED_ASSIGNMENT_PREFIX.length);
  const managed = publishedSnapshot.find((assignment) => assignment.id === managedId);
  return managed ? toBridgedAssignment(managed) : undefined;
}
