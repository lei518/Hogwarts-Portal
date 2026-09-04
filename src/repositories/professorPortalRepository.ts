import type { ProfessorPortalRepository } from "./interfaces/repositoryTypes";
import {
  getProfessorProfile,
  getProfessorProfileByDisplayName,
  getTeachingCourse,
  getTeachingCoursesForProfessor,
  getOfficeHoursForProfessor,
  getAnnouncementsForProfessor,
  getRosterForCourse,
} from "../data/professorPortal";

// getProfile/getTeachingCourseById unchanged since Phase 5A - bridges
// depend on them exactly as they are. Everything below is Authentication
// Foundation (Phase 6B): the professor-scoped reads
// AuthenticatedProfessorContext and utils/professorScope.ts's hooks use, so
// Professor pages never import data/professorPortal.ts directly.
export const professorPortalRepository: ProfessorPortalRepository = {
  getProfile: async () => getProfessorProfile(),
  getTeachingCourseById: async (id) => getTeachingCourse(id),
  getProfileByDisplayName: async (displayName) => getProfessorProfileByDisplayName(displayName),
  getTeachingCoursesForProfessor: async (professorId) => getTeachingCoursesForProfessor(professorId),
  getOfficeHoursForProfessor: async (professorId) => getOfficeHoursForProfessor(professorId),
  getAnnouncementsForProfessor: async (professorId) => getAnnouncementsForProfessor(professorId),
  getRosterForTeachingCourse: async (teachingCourseId) => getRosterForCourse(teachingCourseId),
};

// Phase 5B transitional escape hatch - see coursesRepository.ts's own
// comment. Used by bridges/assignmentBridge.ts, which is invoked
// synchronously from data/assignments.ts, itself called directly and
// synchronously by several Student pages.
export const professorPortalRepositorySync = {
  getProfile: () => getProfessorProfile(),
  getTeachingCourseById: (id: string) => getTeachingCourse(id),
};
