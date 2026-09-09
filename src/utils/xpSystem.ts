// Phase 3 - Profile Cleanup: `awardXp` (level/XP progression) is gone -
// this file keeps just the one generic helper still used elsewhere
// (energy/mastery/relationship clamping).
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
