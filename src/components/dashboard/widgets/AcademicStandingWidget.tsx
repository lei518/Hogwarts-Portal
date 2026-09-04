import { useGame } from "../../../context/GameContext";
import { getAcademicStanding } from "../../../utils/grades";
import { DashboardWidget } from "../DashboardWidget";

// Phase 2 Integration Layer: reads the same computed aggregate
// AcademicStanding.tsx already reads - Grades stays the one place this
// logic lives, this widget only previews it (see CLAUDE.md's Home-vs-page
// preview pattern).
export function AcademicStandingWidget() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const standing = getAcademicStanding(character);

  return (
    <DashboardWidget title="Academic Standing" to="/academic-standing" actionLabel="View Standing">
      <p className="text-parchment text-sm mb-1">{standing.standing}</p>
      <p className="text-parchment-dim text-xs">
        {standing.coursesCompleted} completed &middot; {standing.coursesInProgress} in progress
      </p>
    </DashboardWidget>
  );
}
