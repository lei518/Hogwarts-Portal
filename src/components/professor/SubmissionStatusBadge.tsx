import type { SubmissionStatus } from "../../types/professorPortal";

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  Pending: "#8a8478",
  Reviewed: "#6b9e6b",
  Returned: "#c9a646",
};

// Grade Management's own status badge - tracks a submission through the
// professor's review workflow, distinct from ManagedAssignmentStatusBadge
// (which tracks the assignment itself, not a student's submission to it).
export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
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
