import { useGame } from "../../../context/GameContext";
import { houseInfo } from "../../../data/sortingQuestions";
import type { House } from "../../../types/game";
import { DashboardWidget } from "../DashboardWidget";

const PLACE_LABEL = ["1st", "2nd", "3rd", "4th"];

// Reads the same housePoints data the House Cup page owns, sliced to just
// the student's own house.
export function HouseCupSummaryWidget() {
  const { state } = useGame();
  const { character } = state;

  if (!character || !character.house) return null;

  const ranked = (Object.entries(character.housePoints) as [House, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const rank = ranked.findIndex(([house]) => house === character.house);
  const info = houseInfo[character.house];

  return (
    <DashboardWidget title="House Cup" to="/house" actionLabel="View Standings">
      <p className="text-parchment text-sm mb-1">
        {info.emoji} <span className="text-gold-bright">{character.house}</span> is in{" "}
        {PLACE_LABEL[rank] ?? `${rank + 1}th`} place
      </p>
      <p className="text-parchment-dim text-xs">
        {character.housePoints[character.house]} house points earned.
      </p>
    </DashboardWidget>
  );
}
