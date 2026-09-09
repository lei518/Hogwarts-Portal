import type { ProfessorPortalRepository } from "./interfaces/repositoryTypes";
import type { ProfessorProfile, StudentRosterEntry, TeachingCourse } from "../types/professorPortal";
import { getOfficeHoursForProfessor as getSeededOfficeHours } from "../data/professorPortal";
import { coursesRepository } from "./coursesRepository";
import { listDirectoryProfiles, type DirectoryProfile } from "../services/supabase";

// Phase 7A - Live Academic Data. No seeded professor persona anymore (see
// Part 1) - a professor with no assigned courses just gets an empty
// teaching load, an honest outcome, not an error. Kept only for
// bridges/GradeBridgeSync.tsx, which never actually reaches this in
// practice now that data/professorGrades.ts's seeds are empty (see that
// file's own comment).
const UNASSIGNED_PROFILE: ProfessorProfile = {
  id: "unassigned",
  displayName: "Faculty",
  title: "Professor",
  department: "Not yet on file",
  officeLocation: "Not yet on file",
  bio: "No profile information is on file yet.",
  yearsAtHogwarts: 0,
};

// A professor now teaches at most one section per course (course <->
// professor is a 1:1 live assignment, see course_professor_assignments) -
// `id`/`courseId` are the same value, and "section"/"meetingPattern" are
// generic labels rather than fabricated specifics no data source provides.
async function synthesizeTeachingCourses(professorUserId: string): Promise<TeachingCourse[]> {
  const courses = await coursesRepository.getForProfessor(professorUserId);
  if (courses.length === 0) return [];
  const students = await listDirectoryProfiles("student");
  return courses.map((course) => ({
    id: course.id,
    professorId: professorUserId,
    courseId: course.id,
    section: "All Students",
    meetingPattern: "See Class Schedule",
    enrolledStudentIds: students.filter((student) => student.year === course.requiredYear).map((s) => s.userId),
  }));
}

function toRosterEntry(student: DirectoryProfile, teachingCourseId: string): StudentRosterEntry {
  return {
    id: `${teachingCourseId}:${student.userId}`,
    studentUserId: student.userId,
    studentName: student.displayName,
    house: student.house ?? "Not yet sorted",
    year: student.year ?? 0,
    teachingCourseId,
  };
}

export const professorPortalRepository: ProfessorPortalRepository = {
  getProfile: async () => UNASSIGNED_PROFILE,
  getTeachingCourseById: async (id) => {
    const course = await coursesRepository.getById(id);
    if (!course?.professorId) return undefined;
    const teachingCourses = await synthesizeTeachingCourses(course.professorId);
    return teachingCourses.find((teachingCourse) => teachingCourse.id === id);
  },
  getTeachingCoursesForProfessor: async (professorId) => synthesizeTeachingCourses(professorId),
  getOfficeHoursForProfessor: async (professorId) => getSeededOfficeHours(professorId),
  getRosterForTeachingCourse: async (teachingCourseId) => {
    const course = await coursesRepository.getById(teachingCourseId);
    if (!course) return [];
    const students = await listDirectoryProfiles("student");
    return students
      .filter((student) => student.year === course.requiredYear)
      .map((student) => toRosterEntry(student, teachingCourseId));
  },
};
