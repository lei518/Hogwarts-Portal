import type { StudentSubmission } from "../types/professorPortal";

// Grade Management (Phase 3C) - the starting seed for
// ProfessorGradesContext's local, in-memory state. Seeded only for the two
// Published managed assignments (see data/professorAssignments.ts) - a
// Draft or Archived assignment has no real submissions yet. Entirely
// separate from the Student Portal's data/grades.ts (see
// types/professorPortal.ts's StudentSubmission comment).
export const studentSubmissionSeeds: StudentSubmission[] = [
  // "Shrinking Solution Lab Report" - potions-y1-a
  {
    id: "submission-hermione-shrinking-solution",
    managedAssignmentId: "managed-shrinking-solution-lab",
    studentId: "roster-hermione-granger",
    studentName: "Hermione Granger",
    submittedAt: "2026-09-02",
    status: "Reviewed",
    grade: { score: 95, maxScore: 100 },
    feedback: "Excellent precision - textbook technique.",
  },
  {
    id: "submission-draco-shrinking-solution",
    managedAssignmentId: "managed-shrinking-solution-lab",
    studentId: "roster-draco-malfoy",
    studentName: "Draco Malfoy",
    submittedAt: "2026-09-01",
    status: "Reviewed",
    grade: { score: 88, maxScore: 100 },
    feedback: "Solid work, minor timing issue on the second phase.",
  },
  {
    id: "submission-harry-shrinking-solution",
    managedAssignmentId: "managed-shrinking-solution-lab",
    studentId: "roster-harry-potter",
    studentName: "Harry Potter",
    submittedAt: "2026-09-03",
    status: "Pending",
  },
  {
    id: "submission-neville-shrinking-solution",
    managedAssignmentId: "managed-shrinking-solution-lab",
    studentId: "roster-neville-longbottom",
    studentName: "Neville Longbottom",
    submittedAt: "2026-09-04",
    status: "Pending",
  },
  // "Wiggenweld Potion Essay" - potions-y1-b
  {
    id: "submission-ron-wiggenweld-essay",
    managedAssignmentId: "managed-wiggenweld-essay",
    studentId: "roster-ron-weasley",
    studentName: "Ron Weasley",
    submittedAt: "2026-09-03",
    status: "Returned",
    grade: { score: 72, maxScore: 100 },
    feedback:
      "Solid grasp of the brewing method, but the essay needed more detail on common uses. Please revise the conclusion.",
  },
  {
    id: "submission-blaise-wiggenweld-essay",
    managedAssignmentId: "managed-wiggenweld-essay",
    studentId: "roster-blaise-zabini",
    studentName: "Blaise Zabini",
    submittedAt: "2026-09-02",
    status: "Reviewed",
    grade: { score: 91, maxScore: 100 },
    feedback: "Clear, well-organized, and thorough.",
  },
  {
    id: "submission-seamus-wiggenweld-essay",
    managedAssignmentId: "managed-wiggenweld-essay",
    studentId: "roster-seamus-finnigan",
    studentName: "Seamus Finnigan",
    submittedAt: "2026-09-04",
    status: "Pending",
  },
];
