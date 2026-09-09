import type { Character } from "../types/character";
import type { AcademicProgressStatus, Assignment, Course, DayOfWeek, ScheduleEntry } from "../types/academics";
// Phase 5B/7A: these functions are called synchronously from several page
// render bodies (AcademicProgress, CourseDetail, the Student Planner, ...)
// several layers above this file - making them async would force those
// pages to change, which this milestone explicitly avoids. They read
// data/assignments.ts's live, Supabase-backed synchronous read cache (see
// that file's own comment) instead of a repository directly.
import { schedulesRepositorySync } from "../repositories/schedulesRepository";
import { getAllAssignments, getAssignmentsForCourse } from "../data/assignments";
import { getMySubmissionForAssignment } from "../data/submissions";

const WEEK: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Computed, not stored. A course reaches "Completed" once every assignment
// tied to it (see data/assignments.ts) has been submitted - that's the one
// thing Assignments changes here; a course with no assignments yet simply
// can't reach Completed, same as before this system existed.
//
// Phase 7A - only `id`/`requiredYear` are read, so this accepts the seeded
// catalog shape (no live-resolved professorId) as well as a full Course -
// callers with just the catalog (e.g. pages/Character/Character.tsx) don't
// need to fetch the live join just to compute a status.
export function getCourseStatus(
  character: Character,
  course: Pick<Course, "id" | "requiredYear">
): AcademicProgressStatus {
  if (character.year < course.requiredYear) return "Not Started";

  const courseAssignments = getAssignmentsForCourse(course.id);
  if (courseAssignments.length > 0) {
    const allSubmitted = courseAssignments.every(
      (assignment) => getMySubmissionForAssignment(assignment.id) !== undefined
    );
    if (allSubmitted) return "Completed";
  }

  return "In Progress";
}

// The Planner's "Upcoming Academic Activities" reflects this - Assignments
// (shared, professor-authored) stays the canonical source; only submission
// state is per-student (see data/submissions.ts's live-backed cache).
export function getUpcomingAssignments(character: Character, count: number): Assignment[] {
  return getAllAssignments()
    .filter((assignment) => assignment.requiredYear <= character.year)
    .filter((assignment) => getMySubmissionForAssignment(assignment.id) === undefined)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, count);
}

// The Planner's "Upcoming Classes" reflects this same seeded schedule
// (Academics owns the data) rather than keeping its own copy - starts from
// today and wraps into next week once the week runs out.
export function getUpcomingSchedule(character: Character, count: number): ScheduleEntry[] {
  const entries = schedulesRepositorySync.getForYear(character.year);
  if (entries.length === 0) return [];

  const jsDay = new Date().getDay(); // 0 Sun - 6 Sat
  const todayIndex = jsDay === 0 || jsDay === 6 ? 0 : jsDay - 1;

  const sorted = [...entries].sort((a, b) => {
    const dayDiff = WEEK.indexOf(a.day) - WEEK.indexOf(b.day);
    return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
  });

  const restOfWeek = sorted.filter((e) => WEEK.indexOf(e.day) >= todayIndex);
  const nextWeek = sorted.filter((e) => WEEK.indexOf(e.day) < todayIndex);

  return [...restOfWeek, ...nextWeek].slice(0, count);
}
