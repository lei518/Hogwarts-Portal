import type { ManagedAssignmentsRepository } from "./interfaces/repositoryTypes";
import type { ManagedAssignment } from "../types/professorPortal";
import {
  listAssignments,
  createAssignment as createAssignmentRow,
  updateAssignment as updateAssignmentRow,
  type AssignmentRow,
} from "../services/supabase";

// Phase 7A - Live Academic Data. Backs ProfessorAssignmentsContext with the
// same `assignments` table the Student Portal reads (see
// assignmentsRepository.ts) - `teachingCourseId` here is just the course
// id (a professor now teaches at most one section per course), so both
// repositories map the exact same row, just differently: this one keeps
// every status the RLS policy lets the caller see; the student-facing one
// filters to Published only.
function toManagedAssignment(row: AssignmentRow): ManagedAssignment {
  return {
    id: row.id,
    teachingCourseId: row.courseId,
    title: row.title,
    description: row.description,
    dueDate: row.dueDate,
    itemType: row.itemType,
    status: row.status,
    housePointsReward: row.housePointsReward ?? undefined,
    maxGrade: row.maxGrade ?? undefined,
  };
}

export const managedAssignmentsRepository: ManagedAssignmentsRepository = {
  getAll: async () => (await listAssignments()).map(toManagedAssignment),
  create: async (professorUserId, input) => {
    const row = await createAssignmentRow({
      courseId: input.teachingCourseId,
      professorUserId,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      itemType: input.itemType,
      housePointsReward: input.housePointsReward,
      maxGrade: input.maxGrade,
    });
    return toManagedAssignment(row);
  },
  update: async (id, updates) => {
    const row = await updateAssignmentRow(id, {
      title: updates.title,
      description: updates.description,
      dueDate: updates.dueDate,
      itemType: updates.itemType,
      housePointsReward: updates.housePointsReward,
      maxGrade: updates.maxGrade,
      status: updates.status,
    });
    return toManagedAssignment(row);
  },
};
