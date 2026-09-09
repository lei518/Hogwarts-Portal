import type { SubmissionStatus } from "../../types/academics";

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  Submitted: "#c9a646",
  Late: "#c77b7b",
  Graded: "#6b9e6b",
};

// Grade Management's own status badge - tracks a submission through
// Submitted/Late/Graded, distinct from ManagedAssignmentStatusBadge (which
// tracks the assignment itself, not a student's submission to it).
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
