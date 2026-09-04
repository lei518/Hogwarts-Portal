import type { StudentsRepository } from "./interfaces/repositoryTypes";
import { students, getStudent } from "../data/students";

export const studentsRepository: StudentsRepository = {
  getAll: async () => students,
  getById: async (id) => getStudent(id),
};

// Phase 5B transitional escape hatch - see coursesRepository.ts's own
// comment. Used by utils/adminAnalytics.ts, a hook called synchronously
// from every Admin page's render body.
export const studentsRepositorySync = {
  getAll: () => students,
  getById: (id: string) => getStudent(id),
};
