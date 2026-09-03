import { useGame } from "../../../context/GameContext";
import { ProgressBar } from "../../ui/ProgressBar";
import { houseInfo } from "../../../data/sortingQuestions";
import { getFullName } from "../../../utils/character";

// The portal's hero banner, not a summary card - deliberately doesn't use
// DashboardWidget's bordered-card chrome (see the Home implementation plan).
export function WelcomeWidget() {
  const { state } = useGame();
  const { character } = state;

  if (!character || !character.house) return null;

  const house = houseInfo[character.house];

  return (
    <header
      className="rounded-sm border overflow-hidden"
      style={{ borderColor: `${house.colors.secondary}55` }}
    >
      <div
        className="px-6 md:px-8 py-5 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${house.colors.primary}, ${house.colors.primary}dd)`,
        }}
      >
        <div>
          <p className="text-parchment/70 text-xs uppercase tracking-[0.2em] mb-1">
            🏰 Hogwarts
          </p>
          <h1 className="text-2xl md:text-3xl font-display text-parchment">
            Welcome back, {getFullName(character)}
          </h1>
          <p className="text-parchment/70 text-sm">Year {character.year}</p>
        </div>
        <p className="text-3xl md:text-4xl" style={{ color: house.colors.secondary }}>
          {house.emoji} {character.house}
        </p>
      </div>

      <div className="bg-void/60 px-6 md:px-8 py-6">
        <div className="mb-5">
          <ProgressBar
            value={(character.xp / character.xpToNextLevel) * 100}
            label={`Level ${character.level} · XP ${character.xp}/${character.xpToNextLevel}`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <MiniStat emoji="❤️" label="Health" value={`${character.health}/${character.maxHealth}`} />
          <MiniStat emoji="✨" label="Energy" value={`${character.energy}/${character.maxEnergy}`} />
          <MiniStat emoji="📚" label="Knowledge" value={String(character.knowledge)} />
          <MiniStat
            emoji="🏆"
            label="House Points"
            value={String(character.housePoints[character.house])}
          />
        </div>
      </div>
    </header>
  );
}

function MiniStat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div>
      <p className="text-lg mb-1">{emoji}</p>
      <p className="font-display text-parchment">{value}</p>
      <p className="text-parchment-dim text-[11px] uppercase tracking-wide">{label}</p>
    </div>
  );
}
