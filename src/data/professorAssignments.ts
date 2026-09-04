import type { ManagedAssignment } from "../types/professorPortal";

// Assignment Management (Phase 3B) - the starting seed for
// ProfessorAssignmentsContext's local, in-memory state. Deliberately
// separate from the Student Portal's data/assignments.ts (see
// types/professorPortal.ts's ManagedAssignment comment): publishing one of
// these into that shared, student-facing collection is a future
// integration, not wired this milestone.
export const managedAssignmentSeeds: ManagedAssignment[] = [
  {
    id: "managed-shrinking-solution-lab",
    teachingCourseId: "potions-y1-a",
    title: "Shrinking Solution Lab Report",
    description:
      "Brew a working Shrinking Solution and submit a written account of each step, including any deviations from the standard method.",
    dueDate: "2026-09-10",
    housePointsReward: 10,
    status: "Published",
  },
  {
    id: "managed-horned-slug-worksheet",
    teachingCourseId: "potions-y1-a",
    title: "Horned Slug Properties Worksheet",
    description:
      "Identify the magical properties of horned slug secretion and explain its role in the Wiggenweld Potion.",
    dueDate: "2026-09-16",
    status: "Draft",
  },
  {
    id: "managed-ingredient-safety-quiz",
    teachingCourseId: "potions-y1-a",
    title: "Standard Ingredient Safety Quiz",
    description: "A short written quiz on safe handling of common first-year potion ingredients.",
    dueDate: "2026-08-20",
    status: "Archived",
  },
  {
    id: "managed-wiggenweld-essay",
    teachingCourseId: "potions-y1-b",
    title: "Wiggenweld Potion Essay",
    description:
      "Write a two-foot essay on the Wiggenweld Potion's brewing method and its common uses in the Hospital Wing.",
    dueDate: "2026-09-11",
    housePointsReward: 15,
    status: "Published",
  },
  {
    id: "managed-antidote-theory-quiz",
    teachingCourseId: "potions-y1-b",
    title: "Antidote Theory Quiz",
    description: "A written quiz covering the theoretical principles behind general antidotes.",
    dueDate: "2026-09-19",
    maxGrade: 50,
    status: "Draft",
  },
];
