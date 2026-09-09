import { UserRound } from "lucide-react";
import type { Character } from "../../types/character";
import { houseInfo } from "../../data/sortingQuestions";
import { getFullName } from "../../utils/character";

export function PlayerBadge({ character }: { character: Character }) {
  const house = character.house ? houseInfo[character.house] : null;

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 font-display font-semibold text-parchment"
        style={{
          background: house ? `${house.colors.primary}` : "#242737",
          border: `1px solid ${house ? house.colors.secondary : "#b9944c"}66`,
        }}
      >
        {character.house ? (
          character.house.charAt(0)
        ) : (
          <UserRound size={18} className="text-parchment-dim" />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-display text-parchment truncate leading-tight">{getFullName(character)}</p>
        <p className="text-parchment-dim text-xs truncate">
          Year {character.year} &middot; {character.house}
        </p>
      </div>
    </div>
  );
}
