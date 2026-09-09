import type { Character } from "../types/character";
import type { Course } from "../types/academics";
import type { AcademicStandingLevel, AcademicSummary, GradeRecord, TranscriptRecord } from "../types/grades";
import { calendarRepositorySync } from "../repositories/calendarRepository";
import { getAssignmentsForCourse } from "../data/assignments";
import { getMySubmissions } from "../data/submissions";
import { getCourseStatus } from "./academics";

const PLACEHOLDER = "—";

// `awardedBy` values (see context/GameContext.tsx's AWARD_HOUSE_POINTS
// callers) that count as "earned through Academics" - read-only, and the
// only honest way to report this without a second points ledger.
const ACADEMIC_HOUSE_POINT_SOURCES = ["Potions", "Assignments"];

export function percentageToLetter(percentage: number): string {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

// No formal term-tracking exists on Character yet, so this reads the same
// Academic Calendar dates Resources already owns rather than inventing a
// second "what term is it" source.
export function getCurrentSemester(): string {
  const springBegins = calendarRepositorySync.getById("spring-term-begins");
  const todayIso = new Date().toISOString().slice(0, 10);
  if (springBegins && todayIso >= springBegins.date) return "Spring Term";
  return "Autumn Term";
}

// Phase 2 - Real Academic Workflow. Computed, not stored: averages the
// signed-in student's graded assignment_submissions for this course's
// assignments (see data/submissions.ts's live-backed cache). "Incomplete"
// when nothing has been graded yet - never a fabricated grade.
export function getCourseGrade(courseId: string): GradeRecord {
  const assignmentIds = new Set(getAssignmentsForCourse(courseId).map((assignment) => assignment.id));
  const graded = getMySubmissions().filter(
    (submission) =>
      assignmentIds.has(submission.assignmentId) &&
      submission.status === "Graded" &&
      submission.score !== undefined &&
      submission.maxScore
  );

  if (graded.length === 0) {
    return {
      id: `grade-${courseId}`,
      courseId,
      currentGrade: "Incomplete",
      status: "Incomplete",
      remarks: "No graded assignments yet.",
    };
  }

  const percentage = Math.round(
    graded.reduce((sum, submission) => sum + (submission.score! / submission.maxScore!) * 100, 0) / graded.length
  );

  return {
    id: `grade-${courseId}`,
    courseId,
    currentGrade: percentageToLetter(percentage),
    percentage,
    status: "In Progress",
    remarks: `Based on ${graded.length} graded assignment${graded.length === 1 ? "" : "s"}.`,
  };
}

// Transcript's official record: every course the student has ever been
// eligible for (requiredYear <= their current year), grouped by year -
// generated from completed courses + computed grades, never re-authored
// seed data.
export function getTranscript(character: Character, courses: Course[]): TranscriptRecord {
  const eligible = courses.filter((course) => course.requiredYear <= character.year);
  const years = [...new Set(eligible.map((course) => course.requiredYear))].sort((a, b) => a - b);

  const yearGroups = years.map((year) => ({
    year,
    entries: eligible
      .filter((course) => course.requiredYear === year)
      .map((course) => ({
        courseId: course.id,
        finalGrade: getCourseGrade(course.id).currentGrade,
        credits: PLACEHOLDER,
      })),
  }));

  return { yearGroups, gpa: PLACEHOLDER };
}

// Grades' own header summary - what Academic Progress/Academic Standing/
// Semester Summary used to show as three separate pages (see Phase 2's
// consolidation, CLAUDE.md's Academics section).
export function getAcademicSummary(character: Character, courses: Course[]): AcademicSummary {
  const eligibleCourses = courses.filter((course) => course.requiredYear <= character.year);
  const coursesCompleted = eligibleCourses.filter(
    (course) => getCourseStatus(character, course) === "Completed"
  ).length;
  const coursesInProgress = eligibleCourses.filter(
    (course) => getCourseStatus(character, course) === "In Progress"
  ).length;
  const assignmentsSubmitted = getMySubmissions().length;
  const housePointsEarnedThroughAcademics = character.housePointAwards
    .filter((award) => ACADEMIC_HOUSE_POINT_SOURCES.includes(award.awardedBy))
    .reduce((sum, award) => sum + Math.max(0, award.amount), 0);

  // Honest, not fabricated: without a real GPA there's no threshold to test
  // "Honor Roll" or "Probation" against, so standing only ever reflects
  // whether the student has started coursework at all.
  const standing: AcademicStandingLevel =
    coursesCompleted === 0 && coursesInProgress === 0 ? "Not Yet Determined" : "Good Standing";

  return {
    standing,
    currentSemester: getCurrentSemester(),
    coursesCompleted,
    coursesInProgress,
    assignmentsSubmitted,
    housePointsEarnedThroughAcademics,
  };
}

// The Planner's "Latest Grades" preview reads this instead of re-filtering
// grades itself - Grades stays the one place that logic lives. Only
// courses with at least one graded submission are "graded" - a course
// with nothing graded yet is deliberately excluded rather than shown with
// a fabricated grade.
export function getGradedCourses(character: Character, courses: Course[]): GradeRecord[] {
  return courses
    .filter((course) => course.requiredYear <= character.year)
    .map((course) => getCourseGrade(course.id))
    .filter((grade) => grade.percentage !== undefined);
}
