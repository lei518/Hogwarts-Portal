import type { GradeRecord } from "../types/grades";

// Realistic sample data, not fabricated live grading - professors can't
// submit real grades until a Professor Portal exists (see CLAUDE.md).
// This is the one canonical source both the Grades page and the Transcript
// read from; Transcript never re-seeds its own grade per course.
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

export function getGrade(courseId: string): GradeRecord | undefined {
  return grades.find((grade) => grade.courseId === courseId);
}
