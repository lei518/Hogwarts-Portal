import { MessageSquareText } from "lucide-react";
import { useAcademicData } from "../../../context/AcademicDataContext";
import { DashboardWidget } from "../DashboardWidget";

// Phase 2 - reads the signed-in student's own live, graded submissions
// (see AcademicDataContext) directly - the Grade Management Bridge this
// used to go through (name-matching a seeded StudentSubmission) is gone;
// real submissions carry real feedback with no matching needed.
export function RecentProfessorFeedbackWidget() {
  const { assignments, submissions } = useAcademicData();

  const [latest] = [...submissions]
    .filter((submission) => submission.status === "Graded" && submission.feedback)
    .sort((a, b) => (b.gradedAt ?? "").localeCompare(a.gradedAt ?? ""));
  const assignment = latest ? assignments.find((a) => a.id === latest.assignmentId) : undefined;

  return (
    <DashboardWidget title="Recent Professor Feedback" icon={MessageSquareText} to="/assignments" actionLabel="View Assignments">
      {latest && assignment ? (
        <>
          <p className="text-parchment text-sm mb-1 truncate">{assignment.title}</p>
          <p className="text-parchment-dim text-xs italic">&ldquo;{latest.feedback}&rdquo;</p>
        </>
      ) : (
        <p className="text-parchment-dim text-sm">No feedback yet.</p>
      )}
    </DashboardWidget>
  );
}
