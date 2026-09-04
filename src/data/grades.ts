import type { GradeRecord } from "../types/grades";
import { applyCourseGradeBridge } from "../bridges/gradeRecordBridge";

// Realistic sample data - a per-course grade is replaced by a real,
// professor-reviewed one the moment the Grade Management Bridge confidently
// matches it to the signed-in Character (see bridges/gradeRecordBridge.ts).
// This is the one canonical seed both the Grades page and the Transcript
// read from (through getAllGrades() below); Transcript never re-seeds its
// own grade per course.
export const grades: GradeRecord[] = [
  {
    id: "grade-charms",
    courseId: "charms",
    currentGrade: "A-",
    percentage: 91,
    status: "In Progress",
    remarks: "Confident wandwork. Keep practicing the finer wrist movement on levitation charms.",
  },
  {
    id: "grade-potions",
    courseId: "potions",
    currentGrade: "B",
    percentage: 84,
    status: "In Progress",
    remarks: "Solid results, but ingredient measurements need to be more precise.",
  },
  {
    id: "grade-herbology",
    courseId: "herbology",
    currentGrade: "B+",
    percentage: 87,
    status: "In Progress",
    remarks: "Good handling of temperamental plants. Written identification work could be sharper.",
  },
  {
    id: "grade-dada",
    courseId: "defence-against-the-dark-arts",
    currentGrade: "A",
    percentage: 93,
    status: "In Progress",
    remarks: "Strong grasp of theory. Practical confidence is improving each week.",
  },
  {
    id: "grade-astronomy",
    courseId: "astronomy",
    currentGrade: "B-",
    percentage: 81,
    status: "In Progress",
    remarks: "Observations are accurate; star chart notation needs tidying up.",
  },
  {
    id: "grade-history-of-magic",
    courseId: "history-of-magic",
    currentGrade: "C+",
    percentage: 78,
    status: "In Progress",
    remarks: "Knows the material but participation has been light this term.",
  },
  {
    id: "grade-flying",
    courseId: "flying",
    currentGrade: "Incomplete",
    status: "Incomplete",
    remarks: "Flying lessons are ongoing - a grade has not been recorded yet.",
  },
];

// Phase 3D - Grade Management Bridge: the read layer only, the seed array
// above is untouched. `currentGrade`/`percentage` are replaced when a
// bridged grade exists for that course; `status`/`remarks` are left as
// seeded, since one graded assignment isn't proof the whole course is done.
export function getAllGrades(): GradeRecord[] {
  return grades.map(applyCourseGradeBridge);
}

export function getGrade(courseId: string): GradeRecord | undefined {
  return getAllGrades().find((grade) => grade.courseId === courseId);
}
