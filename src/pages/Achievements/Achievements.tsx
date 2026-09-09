import { Trophy, Lock } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { achievements } from "../../data/achievements";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

export function AchievementsPage() {
  const { state } = useGame();
  const unlockedCount = achievements.filter((a) => (state.character?.achievements ?? []).includes(a.id)).length;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <PageHeader
        title="Achievements"
        description={`${unlockedCount} of ${achievements.length} unlocked.`}
        icon={Trophy}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        {achievements.map((achievement) => {
          const unlocked = (state.character?.achievements ?? []).includes(achievement.id);
          return (
            <Card
              key={achievement.id}
              className={`flex items-start gap-4 px-5 py-4 ${
                unlocked ? "border-gold/40 bg-gold/5" : "opacity-60"
              }`}
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-void/40 shrink-0" aria-hidden="true">
                {unlocked ? (
                  <achievement.icon size={20} className="text-gold-bright" />
                ) : (
                  <Lock size={18} className="text-parchment-dim" />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg text-parchment">{achievement.title}</p>
                <p className="text-parchment-dim text-xs mt-1">{achievement.description}</p>
                <Badge tone={unlocked ? "gold" : "neutral"} className="mt-2">
                  {unlocked ? "Unlocked" : "Locked"}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
