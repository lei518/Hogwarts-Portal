export interface ItemEffect {
  healthDelta?: number;
  energyDelta?: number;
  knowledgeDelta?: number;
  description: string;
}

export const itemEffects: Record<string, ItemEffect> = {
  "Wiggenweld Potion": { healthDelta: 30, description: "Restores 30 health." },
  "Pepperup Potion": { energyDelta: 20, description: "Restores 20 mana." },
  "Felix Felicis": { knowledgeDelta: 5, description: "A stroke of luck sharpens your focus." },
};

export function getItemEffect(name: string): ItemEffect | null {
  return itemEffects[name] ?? null;
}
