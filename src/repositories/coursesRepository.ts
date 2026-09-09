import type { CoursesRepository } from "./interfaces/repositoryTypes";
import type { Course } from "../types/academics";
import { courses, getCourse } from "../data/courses";
import { courseAssignmentsRepository } from "./courseAssignmentsRepository";

// Phase 7A - Live Academic Data. The course catalog itself (name, classroom,
// description, requiredYear) stays the seeded reference content in
// data/courses.ts - it's curriculum, not a person, and the task explicitly
// preserves it. Only `professorId` is resolved live here, from the
// course_professor_assignments table - a course with no assignment
// resolves to `professorId: null` ("To Be Assigned"), never a fabricated
// name.
async function resolveCourses(): Promise<Course[]> {
  const assignments = await courseAssignmentsRepository.getAll();
  const professorByCourse = new Map(assignments.map((a) => [a.courseId, a.professorUserId]));
  return courses.map((course) => ({ ...course, professorId: professorByCourse.get(course.id) ?? null }));
}

export const coursesRepository: CoursesRepository = {
  getAll: async () => resolveCourses(),
  getById: async (id) => (await resolveCourses()).find((course) => course.id === id),
  getForProfessor: async (professorUserId) =>
    (await resolveCourses()).filter((course) => course.professorId === professorUserId),
};

// Phase 5B transitional escape hatch - see utils/grades.ts, the one
// remaining synchronous caller (Grades/Transcript/AcademicStanding/
// SemesterSummary). It only ever reads requiredYear/name from a course, so
// this keeps returning the seeded catalog directly - never the live
// professor join, which needs a real network round trip and has no bearing
// on anything utils/grades.ts computes.
export const coursesRepositorySync = {
  getAll: () => courses,
  getById: (id: string) => getCourse(id),
};
