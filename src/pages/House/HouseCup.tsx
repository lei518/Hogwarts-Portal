import { useGame } from "../../context/GameContext";
import { houseInfo } from "../../data/sortingQuestions";
import type { House } from "../../types/game";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HouseCupPage() {
  const { state } = useGame();

  const ranked = (Object.entries(state.character!.housePoints) as [House, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const maxPoints = Math.max(1, ranked[0]?.[1] ?? 1);
  const medals = ["🥇", "🥈", "🥉", ""];
  const recentAwards = [...state.character!.housePointAwards]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2 text-center">
        🏆 House Cup
      </h1>
      <p className="text-parchment-dim text-sm text-center mb-8">
        Points earned across every corner of the castle.
      </p>

      <div className="flex flex-col gap-4">
        {ranked.map(([house, points], index) => {
          const info = houseInfo[house];
          const isPlayerHouse = state.character?.house === house;
          return (
            <div
              key={house}
              className="border rounded-sm p-5"
              style={{
                borderColor: isPlayerHouse ? `${info.colors.secondary}88` : "transparent",
                background: isPlayerHouse ? `${info.colors.primary}22` : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{medals[index]}</span>
                  <span className="text-2xl">{info.emoji}</span>
                  <div>
                    <p className="font-display text-lg text-parchment">
                      {house}
                      {isPlayerHouse && (
                        <span className="text-xs text-gold-bright ml-2">(your house)</span>
                      )}
                    </p>
                  </div>
                </div>
                <p
                  className="font-display text-2xl"
                  style={{ color: info.colors.secondary }}
                >
                  {points}
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-parchment-dim/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(points / maxPoints) * 100}%`,
                    backgroundColor: info.colors.secondary,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-parchment-dim text-xs uppercase tracking-[0.2em] mt-10 mb-4">
        Recent Point Awards
      </p>
      {recentAwards.length === 0 ? (
        <p className="text-parchment-dim text-sm border border-parchment-dim/15 rounded-sm px-5 py-8 text-center">
          No points have been awarded yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {recentAwards.map((award) => {
            const info = houseInfo[award.house];
            return (
              <div
                key={award.id}
                className="flex items-center justify-between gap-3 border border-parchment-dim/15 rounded-sm px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-parchment text-sm truncate">
                    {info.emoji} {award.reason}
                  </p>
                  <p className="text-parchment-dim text-xs">
                    {award.house} &middot; Awarded by {award.awardedBy} &middot; {formatTimestamp(award.timestamp)}
                  </p>
                </div>
                <p
                  className="font-display text-lg shrink-0"
                  style={{ color: award.amount >= 0 ? info.colors.secondary : "#c77b7b" }}
                >
                  {award.amount >= 0 ? "+" : ""}
                  {award.amount}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
