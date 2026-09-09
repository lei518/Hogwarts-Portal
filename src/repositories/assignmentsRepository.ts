import type { AssignmentsRepository } from "./interfaces/repositoryTypes";
import type { Assignment } from "../types/academics";
import { listAssignments, type AssignmentRow } from "../services/supabase";
import { coursesRepositorySync } from "./coursesRepository";

// Phase 7A - Live Academic Data. Reads the same live `assignments` table
// managedAssignmentsRepository.ts writes to - RLS already restricts what
// comes back to Published rows (plus the caller's own, if they're the
// authoring professor or an admin), so the Published filter here is a
// belt-and-suspenders client-side check, not the actual security boundary.
// `requiredYear` isn't a column on `assignments` - it's resolved from the
// course catalog (data/courses.ts), same as before this table existed.
function toAssignment(row: AssignmentRow): Assignment {
  const course = coursesRepositorySync.getById(row.courseId);
  return {
    id: row.id,
    courseId: row.courseId,
    title: row.title,
    description: row.description,
    dueDate: row.dueDate,
    requiredYear: course?.requiredYear ?? 1,
    itemType: row.itemType,
    housePointsReward: row.housePointsReward ?? undefined,
    maxGrade: row.maxGrade ?? undefined,
  };
}

async function getPublishedAssignments(): Promise<Assignment[]> {
  const rows = await listAssignments();
  return rows.filter((row) => row.status === "Published").map(toAssignment);
}

export const assignmentsRepository: AssignmentsRepository = {
  getAll: async () => getPublishedAssignments(),
  getById: async (id) => (await getPublishedAssignments()).find((assignment) => assignment.id === id),
  getForCourse: async (courseId) =>
    (await getPublishedAssignments()).filter((assignment) => assignment.courseId === courseId),
};
