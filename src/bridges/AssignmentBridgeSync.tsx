import { useEffect } from "react";
import { useProfessorAssignments } from "../context/ProfessorAssignmentsContext";
import { setPublishedManagedAssignments } from "./assignmentBridge";

// Phase 3D - the one component that actually touches
// ProfessorAssignmentsContext on behalf of the bridge. Mounted once at the
// app root (see main.tsx), inside ProfessorAssignmentsProvider, so both the
// Student and Professor Portals share a single instance of that context.
// Renders nothing; it only mirrors Published assignments into the plain
// synchronous snapshot data/assignments.ts's read layer merges in.
export function AssignmentBridgeSync() {
  const { assignments } = useProfessorAssignments();

  useEffect(() => {
    setPublishedManagedAssignments(assignments);
  }, [assignments]);

  return null;
}
