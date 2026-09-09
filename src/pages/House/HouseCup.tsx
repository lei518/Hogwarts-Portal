import { Trophy, Medal, Award } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { houseInfo } from "../../data/sortingQuestions";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import type { House } from "../../types/game";

const RANK_ICONS = [Trophy, Medal, Award];
const RANK_TONES = ["#d9b768", "#c4c4c4", "#b5772e"];

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HouseCupPage() {
  const { state } = useGame();

  const ranked = (Object.entries(state.character!.housePoints) as [House, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const maxPoints = Math.max(1, ranked[0]?.[1] ?? 1);
  const recentAwards = [...state.character!.housePointAwards]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      <PageHeader title="House Cup" description="Points earned across every corner of the castle." icon={Trophy} />

      <div className="flex flex-col gap-4 mt-8">
        {ranked.map(([house, points], index) => {
          const info = houseInfo[house];
          const isPlayerHouse = state.character?.house === house;
          const RankIcon = RANK_ICONS[index];
          return (
            <Card
              key={house}
              className="p-5"
              style={{
                borderColor: isPlayerHouse ? `${info.colors.secondary}88` : undefined,
                background: isPlayerHouse ? `${info.colors.primary}22` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {RankIcon ? (
                    <RankIcon size={22} style={{ color: RANK_TONES[index] }} />
                  ) : (
                    <span className="w-5.5 text-center text-parchment-dim text-sm">{index + 1}</span>
                  )}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: info.colors.secondary }}
                    aria-hidden="true"
                  />
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
            </Card>
          );
        })}
      </div>

      <p className="text-parchment-dim text-xs uppercase tracking-[0.2em] mt-10 mb-4">
        Recent Point Awards
      </p>
      {recentAwards.length === 0 ? (
        <EmptyState message="No points have been awarded yet." icon={Trophy} />
      ) : (
        <div className="flex flex-col gap-2">
          {recentAwards.map((award) => {
            const info = houseInfo[award.house];
            return (
              <Card key={award.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-parchment text-sm truncate">{award.reason}</p>
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
