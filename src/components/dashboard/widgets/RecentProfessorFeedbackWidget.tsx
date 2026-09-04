import { MessageSquareText } from "lucide-react";
import { useGradeBridgeMatches } from "../../../bridges/gradeBridge";
import { getAssignment } from "../../../data/assignments";
import { DashboardWidget } from "../DashboardWidget";

// Phase 3D - the one Dashboard widget that reads live, cross-boundary
// bridge data instead of Character alone: written feedback isn't stored on
// AssignmentSubmission (see GameContext.tsx's APPLY_PROFESSOR_GRADE - grade
// and status only, nothing else), so this reads it straight from the
// Professor Portal's own ProfessorGradesContext, through the same
// name-matched bridge that decides everything else - never another
// student's feedback.
export function RecentProfessorFeedbackWidget() {
  const matches = useGradeBridgeMatches();
  const withFeedback = matches.filter((match) => match.feedback);
  const [latest] = withFeedback;

  const assignment = latest ? getAssignment(latest.assignmentId) : undefined;

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
