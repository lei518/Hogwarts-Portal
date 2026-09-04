import type { GradesRepository } from "./interfaces/repositoryTypes";
import { getAllGrades, getGrade } from "../data/grades";

// Phase 5B: async public interface. Still delegates to data/grades.ts,
// which already merges in the Grade Management Bridge's per-course
// override - untouched behavior.
export const gradesRepository: GradesRepository = {
  getAll: async () => getAllGrades(),
  getForCourse: async (courseId) => getGrade(courseId),
};

// Phase 5B transitional escape hatch - see coursesRepository.ts's own
// comment. Used by utils/grades.ts's own functions (getTranscript,
// getAcademicStanding, getGradedCourses, getSemesterSummary), which are
// themselves called synchronously from several pages.
export const gradesRepositorySync = {
  getAll: () => getAllGrades(),
  getForCourse: (courseId: string) => getGrade(courseId),
};
