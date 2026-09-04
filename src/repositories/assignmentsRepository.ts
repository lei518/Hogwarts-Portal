import type { AssignmentsRepository } from "./interfaces/repositoryTypes";
import { getAllAssignments, getAssignment, getAssignmentsForCourse } from "../data/assignments";

// Phase 5B: async public interface. Still delegates to data/assignments.ts,
// which already merges in Published ManagedAssignments via the Phase 3D
// bridge - that merge behavior is untouched.
export const assignmentsRepository: AssignmentsRepository = {
  getAll: async () => getAllAssignments(),
  getById: async (id) => getAssignment(id),
  getForCourse: async (courseId) => getAssignmentsForCourse(courseId),
};

// Phase 5B transitional escape hatch - see coursesRepository.ts's own
// comment for why this exists. Used by utils/academics.ts and
// utils/adminAnalytics.ts.
export const assignmentsRepositorySync = {
  getAll: () => getAllAssignments(),
  getById: (id: string) => getAssignment(id),
  getForCourse: (courseId: string) => getAssignmentsForCourse(courseId),
};
