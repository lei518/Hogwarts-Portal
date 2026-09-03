import { useGame } from "../../../context/GameContext";
import { getCurrentObjectives } from "../../../utils/objectives";
import { DashboardWidget } from "../DashboardWidget";

// Reads whichever system's objective currently sorts first (see
// utils/objectives.ts) - today that's always Campus Map exploration, but
// this widget doesn't know or care which system it was, so a future
// provider (Academics, Events, House Cup, ...) shows up here for free.
export function CurrentFocusWidget() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const objective = getCurrentObjectives(character)[0];

  return (
    <DashboardWidget title="Current Focus" to="/adventure" actionLabel="Open Planner">
      {objective ? (
        <>
          <p className="text-parchment text-sm mb-1">{objective.title}</p>
          <p className="text-parchment-dim text-xs">{objective.description}</p>
        </>
      ) : (
        <p className="text-parchment-dim text-sm">
          You're all caught up — check back as you progress.
        </p>
      )}
    </DashboardWidget>
  );
}
