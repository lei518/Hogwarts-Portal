import type { GameState } from "../types/game";
import type { ChoiceRequirement } from "../data/adventures";

export function meetsRequirement(requirement: ChoiceRequirement | undefined, state: GameState): boolean {
  if (!requirement) return true;

  switch (requirement.type) {
    case "spell": {
      const progress = state.character?.spellbook.find((s) => s.spellId === requirement.id);
      return progress?.unlocked === true;
    }
    case "relationship": {
      const value = state.character?.relationships[requirement.id ?? ""] ?? 0;
      return value >= (requirement.minValue ?? 0);
    }
    case "knowledge": {
      const knowledge = state.character?.knowledge ?? 0;
      return knowledge >= (requirement.minValue ?? 0);
    }
    default:
      return true;
  }
}
