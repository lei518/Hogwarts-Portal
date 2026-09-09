import { useAcademicData } from "../../../context/AcademicDataContext";
import { DashboardWidget } from "../DashboardWidget";
import { Percent } from "lucide-react";

// Phase 2 - reads the signed-in student's own live submissions (see
// AcademicDataContext, backed by the real assignment_submissions table)
// instead of Character.assignmentSubmissions, which no longer exists - a
// professor's grade is now visible the moment they save it, not through a
// name-matching bridge.
export function LatestGradedAssignmentWidget() {
  const { assignments, submissions } = useAcademicData();

  const [latest] = [...submissions]
    .filter((submission) => submission.status === "Graded")
    .sort((a, b) => (b.gradedAt ?? "").localeCompare(a.gradedAt ?? ""));
  const assignment = latest ? assignments.find((a) => a.id === latest.assignmentId) : undefined;

  return (
    <DashboardWidget title="Latest Graded Assignment" icon={Percent} to="/assignments" actionLabel="View Assignments">
      {latest && assignment ? (
        <>
          <p className="text-parchment text-sm mb-1 truncate">{assignment.title}</p>
          <p className="text-parchment-dim text-xs">
            Grade: {latest.score}/{latest.maxScore}
          </p>
        </>
      ) : (
        <p className="text-parchment-dim text-sm">No graded assignments yet.</p>
      )}
    </DashboardWidget>
  );
}
