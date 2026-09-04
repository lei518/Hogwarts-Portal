import type { ProfessorsRepository } from "./interfaces/repositoryTypes";
import { professors, getProfessor, getCoursesForProfessor } from "../data/professors";

export const professorsRepository: ProfessorsRepository = {
  getAll: async () => professors,
  getById: async (id) => getProfessor(id),
  getCoursesForProfessor: async (professorId) => getCoursesForProfessor(professorId),
};

// Phase 5B transitional escape hatch - see coursesRepository.ts's own
// comment. Used by utils/adminAnalytics.ts.
export const professorsRepositorySync = {
  getAll: () => professors,
  getById: (id: string) => getProfessor(id),
  getCoursesForProfessor: (professorId: string) => getCoursesForProfessor(professorId),
};
