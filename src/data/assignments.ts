import type { Assignment } from "../types/academics";
import { daysFromToday } from "../utils/dates";
import { getBridgedAssignment, getBridgedAssignments } from "../bridges/assignmentBridge";

// Shared, professor-authored definitions - not per-character state (see
// character.assignmentSubmissions for that). Every page in this codebase
// reads assignments only through the functions below, never by importing
// this array directly - that's the seam a future Professor Portal plugs
// into: it would create/edit/delete entries in this same collection
// (eventually backed by a real data source instead of a static array),
// and every student-facing page keeps working unchanged because it never
// depended on how the data got here.
const assignments: Assignment[] = [
  {
    id: "charms-feather-float-essay",
    courseId: "charms",
    title: "Feather-Float Essay",
    description:
      "Explain the wand movement and incantation behind Wingardium Leviosa, and why 'swish and flick' matters.",
    dueDate: daysFromToday(5),
    requiredYear: 1,
    housePointsReward: 5,
  },
  {
    id: "potions-cure-for-boils-report",
    courseId: "potions",
    title: "Cure for Boils Report",
    description: "Write up your cauldron results and explain any deviation from the standard method.",
    dueDate: daysFromToday(10),
    requiredYear: 1,
    housePointsReward: 5,
  },
  {
    id: "herbology-identification-chart",
    courseId: "herbology",
    title: "Magical Herbs Identification Chart",
    description: "Label and describe five plants covered in the Greenhouses this term.",
    dueDate: daysFromToday(8),
    requiredYear: 1,
  },
  {
    id: "dada-dark-creatures-quiz-prep",
    courseId: "defence-against-the-dark-arts",
    title: "Recognizing Dark Creatures: Quiz Prep",
    description: "Review notes on the creatures covered so far in preparation for next week's quiz.",
    dueDate: daysFromToday(12),
    requiredYear: 1,
    housePointsReward: 10,
  },
  {
    id: "astronomy-observation-log",
    courseId: "astronomy",
    title: "Star Chart Observation Log",
    description: "Record what you observe from the Astronomy Tower across three clear nights.",
    dueDate: daysFromToday(20),
    requiredYear: 1,
    housePointsReward: 5,
  },
];

// Phase 3D - Published Assignment Bridge: each function below also merges
// in Published ManagedAssignments from the Professor Portal (see
// bridges/assignmentBridge.ts) - Draft and Archived ones never appear here.
// The seed array above is untouched; only the read layer is extended, per
// CLAUDE.md's Assignment Management integration seam.
export function getAssignment(id: string): Assignment | undefined {
  return assignments.find((assignment) => assignment.id === id) ?? getBridgedAssignment(id);
}

export function getAllAssignments(): Assignment[] {
  return [...assignments, ...getBridgedAssignments()];
}

export function getAssignmentsForCourse(courseId: string): Assignment[] {
  return getAllAssignments().filter((assignment) => assignment.courseId === courseId);
}
