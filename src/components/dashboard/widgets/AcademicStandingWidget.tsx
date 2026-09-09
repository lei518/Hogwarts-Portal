import { useGame } from "../../../context/GameContext";
import { useAcademicData } from "../../../context/AcademicDataContext";
import { getAcademicSummary } from "../../../utils/grades";
import { DashboardWidget } from "../DashboardWidget";

// Phase 2 - Academic Standing folded into Grades (see CLAUDE.md's
// Academics section) - this widget previews Grades' own header summary,
// same "Home previews, the owning page manages" pattern as every other
// Dashboard widget.
export function AcademicStandingWidget() {
  const { state } = useGame();
  const { character } = state;
  const { courses } = useAcademicData();

  if (!character) return null;

  const summary = getAcademicSummary(character, courses);

  return (
    <DashboardWidget title="Academic Standing" to="/grades" actionLabel="View Grades">
      <p className="text-parchment text-sm mb-1">{summary.standing}</p>
      <p className="text-parchment-dim text-xs">
        {summary.coursesCompleted} completed &middot; {summary.coursesInProgress} in progress
      </p>
    </DashboardWidget>
  );
}
