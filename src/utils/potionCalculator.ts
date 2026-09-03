import type { Potion } from "../data/potions";

export function scaleIngredients(potion: Potion, numberOfPotions: number) {
  const quantity = Math.max(1, Math.round(numberOfPotions));
  return potion.ingredients.map((ingredient) => ({
    name: ingredient.name,
    amount: ingredient.amount * quantity,
  }));
}

export type BrewQuality = "Failed" | "Poor" | "Acceptable" | "Good" | "Excellent";

export function getBrewQuality(score: number): BrewQuality {
  if (score < 40) return "Failed";
  if (score < 60) return "Poor";
  if (score < 75) return "Acceptable";
  if (score < 90) return "Good";
  return "Excellent";
}

export function getBrewRewards(quality: BrewQuality, difficulty: number) {
  const qualityMultiplier: Record<BrewQuality, number> = {
    Failed: 0,
    Poor: 0.4,
    Acceptable: 0.7,
    Good: 1,
    Excellent: 1.3,
  };

  const housePoints: Record<BrewQuality, number> = {
    Failed: 0,
    Poor: 0,
    Acceptable: 0,
    Good: 5,
    Excellent: 10,
  };

  const multiplier = qualityMultiplier[quality];
  return {
    xp: Math.round(15 * difficulty * multiplier),
    masteryGain: Math.round(8 * multiplier),
    yieldsPotion: quality !== "Failed",
    housePointsDelta: housePoints[quality],
  };
}
