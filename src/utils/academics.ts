import type { Character } from "../types/character";
import type { AcademicProgressStatus, Assignment, Course, DayOfWeek, ScheduleEntry } from "../types/academics";
// Phase 5B: these functions are called synchronously from several page
// render bodies (AcademicProgress, CourseDetail, the Student Planner, ...)
// several layers above this file - making them async would force those
// pages to change, which this milestone explicitly avoids. They read the
// repositories' Phase 5B transitional sync accessor instead (see
// repositories/*.ts's own comments on why it exists and when it goes away).
import { schedulesRepositorySync } from "../repositories/schedulesRepository";
import { assignmentsRepositorySync } from "../repositories/assignmentsRepository";

const WEEK: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Computed, not stored. A course reaches "Completed" once every assignment
// tied to it (see data/assignments.ts) has been submitted - that's the one
// thing Assignments changes here; a course with no assignments yet simply
// can't reach Completed, same as before this system existed.
export function getCourseStatus(character: Character, course: Course): AcademicProgressStatus {
  if (character.year < course.requiredYear) return "Not Started";

  const courseAssignments = assignmentsRepositorySync.getForCourse(course.id);
  if (courseAssignments.length > 0) {
    const allSubmitted = courseAssignments.every(
      (assignment) => character.assignmentSubmissions[assignment.id]?.status === "Submitted"
    );
    if (allSubmitted) return "Completed";
  }

  return "In Progress";
}

// The Planner's "Assignment Deadlines" reflects this - Assignments (shared,
// professor-authored) stays the canonical source; only submission state
// lives on Character.
export function getUpcomingAssignments(character: Character, count: number): Assignment[] {
  return assignmentsRepositorySync
    .getAll()
    .filter((assignment) => assignment.requiredYear <= character.year)
    .filter((assignment) => character.assignmentSubmissions[assignment.id]?.status !== "Submitted")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, count);
}

// Aggregated from the Spellbook's own data (data/spells.ts + character.spellbook)
// rather than a new field - Spellbook stays the canonical source.
export function getSpellMasterySummary(character: Character): string {
  if (character.spellbook.length === 0) return "Not yet started";
  const total = character.spellbook.reduce((sum, s) => sum + s.mastery, 0);
  const average = Math.round(total / character.spellbook.length);
  return `${character.spellbook.length} spell${character.spellbook.length === 1 ? "" : "s"} · ${average}% avg mastery`;
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
