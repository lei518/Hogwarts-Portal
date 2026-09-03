import { useGame } from "../../context/GameContext";
import { achievements } from "../../data/achievements";

export function AchievementsPage() {
  const { state } = useGame();
  const unlockedCount = achievements.filter((a) => (state.character?.achievements ?? []).includes(a.id)).length;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">
        🏆 Achievements
      </h1>
      <p className="text-parchment-dim text-sm mb-6">
        {unlockedCount} of {achievements.length} unlocked.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((achievement) => {
          const unlocked = (state.character?.achievements ?? []).includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`flex items-start gap-4 border rounded-sm px-5 py-4 transition-colors duration-150 ${
                unlocked ? "border-gold/40 bg-gold/5" : "border-parchment-dim/15 opacity-60"
              }`}
            >
              <span className="text-3xl shrink-0" aria-hidden="true">
                {unlocked ? achievement.emoji : "🔒"}
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg text-parchment">{achievement.title}</p>
                <p className="text-parchment-dim text-xs mt-1">{achievement.description}</p>
                <p
                  className={`text-[11px] uppercase tracking-wide mt-2 ${
                    unlocked ? "text-gold-bright" : "text-parchment-dim"
                  }`}
                >
                  {unlocked ? "Unlocked" : "Locked"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
