import type { CoursesRepository } from "./interfaces/repositoryTypes";
import { courses, getCourse } from "../data/courses";

// Phase 5B: the public, Promise-based interface Phase 5C will back with
// real Supabase calls. No network yet - still the same seed data as
// Phase 5A, just wrapped in `async` per the milestone's rules.
export const coursesRepository: CoursesRepository = {
  getAll: async () => courses,
  getById: async (id) => getCourse(id),
};

// Phase 5B transitional escape hatch. utils/grades.ts and
// bridges/assignmentBridge.ts call this synchronously from deep inside
// call chains several layers below page render bodies (CourseDetail,
// AcademicStanding, Transcript, Grades, ...) - making those async would
// force page-level rewrites, which this milestone explicitly avoids.
// Reads the exact same source the async methods above wrap; zero behavior
// difference, since Phase 5B never touches real, possibly-slow, network
// data. Phase 5C removes this once those call sites migrate to real async
// data-fetching (see that phase's own deferred-items list).
export const coursesRepositorySync = {
  getAll: () => courses,
  getById: (id: string) => getCourse(id),
};
