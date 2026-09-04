import type { ManagedAssignmentsRepository } from "./interfaces/repositoryTypes";
import { managedAssignmentSeeds } from "../data/professorAssignments";

// Seeds ProfessorAssignmentsContext's initial state (see
// context/ProfessorAssignmentsContext.tsx) - the Context remains the
// canonical owner of live, in-session edits; this repository only supplies
// its starting values. Its sole consumer is a Context that now genuinely
// awaits this (via useEffect), so no transitional sync escape hatch is
// needed here.
export const managedAssignmentsRepository: ManagedAssignmentsRepository = {
  getAll: async () => managedAssignmentSeeds,
};
