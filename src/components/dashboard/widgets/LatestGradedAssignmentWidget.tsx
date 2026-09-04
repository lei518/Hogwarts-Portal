import { useGame } from "../../../context/GameContext";
import { getAssignment } from "../../../data/assignments";
import { DashboardWidget } from "../DashboardWidget";
import { Percent } from "lucide-react";

// Phase 3D - reads Character.assignmentSubmissions directly, exactly like
// every other Dashboard widget reads its own owning module's data. Once
// the Grade Management Bridge sets a submission's status to "Graded" (see
// context/GameContext.tsx's APPLY_PROFESSOR_GRADE case), it's canonical
// Student Portal data - this widget doesn't need to know a Professor
// Portal exists.
export function LatestGradedAssignmentWidget() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const [latest] = Object.values(character.assignmentSubmissions)
    .filter((submission) => submission.status === "Graded")
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));

  const assignment = latest ? getAssignment(latest.assignmentId) : undefined;

  return (
    <DashboardWidget title="Latest Graded Assignment" icon={Percent} to="/assignments" actionLabel="View Assignments">
      {latest && assignment ? (
        <>
          <p className="text-parchment text-sm mb-1 truncate">{assignment.title}</p>
          <p className="text-parchment-dim text-xs">Grade: {latest.grade}</p>
        </>
      ) : (
        <p className="text-parchment-dim text-sm">No graded assignments yet.</p>
      )}
    </DashboardWidget>
  );
}
