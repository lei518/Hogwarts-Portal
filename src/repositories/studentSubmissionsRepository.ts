import type { StudentSubmissionsRepository } from "./interfaces/repositoryTypes";
import { studentSubmissionSeeds } from "../data/professorGrades";

// Seeds ProfessorGradesContext's initial state - same pattern as
// managedAssignmentsRepository.ts, including no sync escape hatch needed.
export const studentSubmissionsRepository: StudentSubmissionsRepository = {
  getAll: async () => studentSubmissionSeeds,
};
