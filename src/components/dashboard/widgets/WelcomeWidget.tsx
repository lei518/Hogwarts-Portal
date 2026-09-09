import type { ComponentType } from "react";
import { Sparkles, BookOpen, Trophy } from "lucide-react";
import { useGame } from "../../../context/GameContext";
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
      className="rounded-lg border overflow-hidden shadow-sm shadow-black/20"
      style={{ borderColor: `${house.colors.secondary}55` }}
    >
      <div
        className="px-6 md:px-8 py-5 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${house.colors.primary}, ${house.colors.primary}dd)`,
        }}
      >
        <div>
          <p className="text-parchment/70 text-xs font-medium uppercase tracking-[0.2em] mb-1">
            Student Portal
          </p>
          <h1 className="text-2xl md:text-3xl font-display text-parchment">
            Welcome back, {getFullName(character)}
          </h1>
          <p className="text-parchment/70 text-sm">Year {character.year}</p>
        </div>
        <p
          className="text-sm font-medium uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border"
          style={{ color: house.colors.secondary, borderColor: `${house.colors.secondary}55` }}
        >
          {character.house}
        </p>
      </div>

      <div className="bg-void/50 px-6 md:px-8 py-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <MiniStat icon={Sparkles} label="Energy" value={`${character.energy}/${character.maxEnergy}`} />
          <MiniStat icon={BookOpen} label="Knowledge" value={String(character.knowledge)} />
          <MiniStat
            icon={Trophy}
            label="House Points"
            value={String(character.housePoints[character.house])}
          />
        </div>
      </div>
    </header>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <Icon size={18} className="text-gold/80 mx-auto mb-1.5" />
      <p className="font-display text-parchment">{value}</p>
      <p className="text-parchment-dim text-[11px] uppercase tracking-wide">{label}</p>
    </div>
  );
}
