import type { AssignmentStatus } from "../../types/academics";

const STATUS_COLORS: Record<AssignmentStatus, string> = {
  "Not Started": "#8a8478",
  Submitted: "#c9a646",
  Graded: "#6b9e6b",
};

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
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
