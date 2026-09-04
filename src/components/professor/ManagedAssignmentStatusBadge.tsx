import type { AssignmentStatus } from "../../types/professorPortal";

const STATUS_COLORS: Record<AssignmentStatus, string> = {
  Draft: "#8a8478",
  Published: "#6b9e6b",
  Archived: "#c9a646",
};

// Assignment Management's own status badge - distinct from the Student
// Portal's AssignmentStatusBadge (components/academics), which tracks a
// student's submission progress rather than a professor's authoring
// workflow. Same visual pattern, different vocabulary.
export function ManagedAssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
      style={{ color, borderColor: `${color}66`, background: `${color}15` }}
    >
      {status}
    </span>
  );
}
