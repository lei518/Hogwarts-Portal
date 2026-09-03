import type { GameState } from "../types/game";
import { spells as spellData } from "./spells";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  isUnlocked: (state: GameState) => boolean;
}

const TOTAL_LOCATIONS = 17;
const NIGHT_START_HOUR = 21;
const NIGHT_END_HOUR = 5;

function isNightTime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

export const achievements: Achievement[] = [
  {
    id: "first-spell",
    title: "First Spell",
    description: "Cast your very first spell.",
    emoji: "✨",
    isUnlocked: (state) => (state.character?.spellbook.length ?? 0) > 0,
  },
  {
    id: "bookworm",
    title: "Bookworm",
    description: "Study 5 books from the library.",
    emoji: "📚",
    isUnlocked: (state) => (state.character?.studiedBooks.length ?? 0) >= 5,
  },
  {
    id: "potion-master",
    title: "Potion Master",
    description: "Reach 100 mastery brewing a single potion.",
    emoji: "🧪",
    isUnlocked: (state) =>
      Object.values(state.character?.potionProgress ?? {}).some((p) => p.mastery >= 100),
  },
  {
    id: "explorer",
    title: "Explorer",
    description: `Discover all ${TOTAL_LOCATIONS} locations around the castle.`,
    emoji: "🗺️",
    isUnlocked: (state) => (state.character?.discoveredLocations.length ?? 0) >= TOTAL_LOCATIONS,
  },
  {
    id: "dueling-champion",
    title: "Dueling Champion",
    description: "Reach 100 mastery in a Defense Against the Dark Arts spell.",
    emoji: "⚔️",
    isUnlocked: (state) =>
      (state.character?.spellbook ?? []).some((progress) => {
        if (progress.mastery < 100) return false;
        const spell = spellData.find((s) => s.id === progress.spellId);
        return spell?.category === "Defense";
      }),
  },
  {
    id: "house-pride",
    title: "House Pride",
    description: "Earn 100 points for your house.",
    emoji: "🏆",
    isUnlocked: (state) =>
      !!state.character?.house && state.character.housePoints[state.character.house] >= 100,
  },
  {
    id: "wand-chosen",
    title: "Wand Chosen",
    description: "Be chosen by your wand.",
    emoji: "🪄",
    isUnlocked: (state) => state.character?.wand != null,
  },
  {
    id: "night-explorer",
    title: "Night Explorer",
    description: "Discover a location while wandering the castle at night.",
    emoji: "🌙",
    isUnlocked: (state) => (state.character?.discoveredLocations.length ?? 0) > 0 && isNightTime(),
  },
];

export function getUnlockedAchievementIds(state: GameState): string[] {
  return achievements.filter((achievement) => achievement.isUnlocked(state)).map((a) => a.id);
}
