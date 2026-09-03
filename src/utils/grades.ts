import type { Character } from "../types/character";
import type { AcademicStanding, AcademicStandingLevel, SemesterSummary, TranscriptRecord } from "../types/grades";
import { grades } from "../data/grades";
import { courses } from "../data/courses";
import { getCourseStatus } from "./academics";
import { getCalendarEvent } from "../data/academicCalendar";

const PLACEHOLDER = "—";

// `awardedBy` values (see context/GameContext.tsx's AWARD_HOUSE_POINTS
// callers) that count as "earned through Academics" - read-only, and the
// only honest way to report this without a second points ledger.
const ACADEMIC_HOUSE_POINT_SOURCES = ["Potions", "Assignments"];

function percentageToLetter(percentage: number): string {
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
  const springBegins = getCalendarEvent("spring-term-begins");
  const todayIso = new Date().toISOString().slice(0, 10);
  if (springBegins && todayIso >= springBegins.date) return "Spring Term";
  return "Autumn Term";
}

export function getTranscript(character: Character): TranscriptRecord {
  const entries = grades
    .map((grade) => ({
      courseId: grade.courseId,
      finalGrade: grade.currentGrade,
      credits: PLACEHOLDER,
    }))
    .filter((entry) => {
      const course = courses.find((c) => c.id === entry.courseId);
      return course ? course.requiredYear <= character.year : false;
    });

  return {
    academicYear: `Year ${character.year}`,
    semester: getCurrentSemester(),
    entries,
    gpa: PLACEHOLDER,
  };
}

export function getAcademicStanding(character: Character): AcademicStanding {
  const eligibleCourses = courses.filter((course) => course.requiredYear <= character.year);
  const coursesCompleted = eligibleCourses.filter(
    (course) => getCourseStatus(character, course) === "Completed"
  ).length;
  const coursesInProgress = eligibleCourses.filter(
    (course) => getCourseStatus(character, course) === "In Progress"
  ).length;
  const assignmentsSubmitted = Object.values(character.assignmentSubmissions).filter(
    (submission) => submission.status === "Submitted"
  ).length;
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
    gpa: PLACEHOLDER,
    creditsEarned: PLACEHOLDER,
    coursesCompleted,
    coursesInProgress,
    assignmentsSubmitted,
    housePointsEarnedThroughAcademics,
  };
}

export function getSemesterSummary(character: Character): SemesterSummary {
  const eligibleGrades = grades.filter((grade) => {
    const course = courses.find((c) => c.id === grade.courseId);
    return course ? course.requiredYear <= character.year : false;
  });
  const graded = eligibleGrades.filter((grade) => grade.percentage !== undefined);
  const averagePercentage = graded.length
    ? Math.round(graded.reduce((sum, grade) => sum + (grade.percentage ?? 0), 0) / graded.length)
    : null;

  const assignmentsCompleted = Object.values(character.assignmentSubmissions).filter(
    (submission) => submission.status === "Submitted"
  ).length;

  return {
    semester: getCurrentSemester(),
    coursesTaken: eligibleGrades.length,
    assignmentsCompleted,
    averageGrade:
      averagePercentage === null ? "Not available" : `${percentageToLetter(averagePercentage)} (${averagePercentage}%)`,
    standing: getAcademicStanding(character).standing,
    professorFeedback: "Professor feedback will appear here once professors can submit it through the Professor Portal.",
  };
}
