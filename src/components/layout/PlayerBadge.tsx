import type { Character } from "../../types/character";
import { houseInfo } from "../../data/sortingQuestions";
import { getFullName } from "../../utils/character";

export function PlayerBadge({ character }: { character: Character }) {
  const house = character.house ? houseInfo[character.house] : null;

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{
          background: house ? `${house.colors.primary}` : "#2a231a",
          border: `1px solid ${house ? house.colors.secondary : "#c9a646"}66`,
        }}
      >
        {house?.emoji ?? "🧙"}
      </div>
      <div className="min-w-0">
        <p className="font-display text-parchment truncate leading-tight">{getFullName(character)}</p>
        <p className="text-parchment-dim text-xs truncate">
          Level {character.level} &middot; {character.house}
        </p>
      </div>
    </div>
  );
}
