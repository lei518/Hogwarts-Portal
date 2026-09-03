export type MasteryLevel = "Novice" | "Apprentice" | "Adept" | "Expert" | "Master";

export function getMasteryLevel(mastery: number): MasteryLevel {
  if (mastery >= 81) return "Master";
  if (mastery >= 61) return "Expert";
  if (mastery >= 41) return "Adept";
  if (mastery >= 21) return "Apprentice";
  return "Novice";
}

/** Higher mastery increases the chance a cast succeeds. */
export function getSuccessChance(mastery: number): number {
  return Math.min(0.97, 0.55 + mastery * 0.004);
}

/** Higher mastery slightly reduces the effective mana cost of a spell. */
export function getEffectiveManaCost(baseCost: number, mastery: number): number {
  const discount = Math.min(0.4, mastery * 0.004);
  return Math.max(1, Math.round(baseCost * (1 - discount)));
}
