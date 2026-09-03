import type { Character } from "../types/character";

/**
 * Applies an XP gain to a character, handling one or more level-ups.
 * Leveling up scales the XP requirement, raises max health/energy,
 * and fully restores both as a small reward for reaching the new level.
 */
export function awardXp(character: Character, amount: number): Character {
  let { level, xp, xpToNextLevel, maxHealth, maxEnergy } = character;
  xp += amount;
  let leveledUp = false;

  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    level += 1;
    xpToNextLevel = Math.round(xpToNextLevel * 1.25);
    maxHealth += 10;
    maxEnergy += 10;
    leveledUp = true;
  }

  return {
    ...character,
    level,
    xp,
    xpToNextLevel,
    maxHealth,
    maxEnergy,
    health: leveledUp ? maxHealth : character.health,
    energy: leveledUp ? maxEnergy : character.energy,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
