import type { ComponentType } from "react";
import { Sparkles, BookOpen, FlaskConical, Map as MapIcon, Swords, Trophy, Wand2, Moon } from "lucide-react";
import type { GameState } from "../types/game";
import { spells as spellData } from "./spells";
import { potions as potionData } from "./potions";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
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
    icon: Sparkles,
    isUnlocked: (state) => (state.character?.spellbook.length ?? 0) > 0,
  },
  {
    id: "bookworm",
    title: "Bookworm",
    description: "Study 5 books from the library.",
    icon: BookOpen,
    isUnlocked: (state) => (state.character?.studiedBooks.length ?? 0) >= 5,
  },
  {
    id: "potion-master",
    title: "Potion Master",
    description: "Study every potion in the Potion Archive.",
    icon: FlaskConical,
    isUnlocked: (state) =>
      Object.values(state.character?.potionProgress ?? {}).filter((p) => p.studied).length >=
      potionData.length,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: `Discover all ${TOTAL_LOCATIONS} locations around the castle.`,
    icon: MapIcon,
    isUnlocked: (state) => (state.character?.discoveredLocations.length ?? 0) >= TOTAL_LOCATIONS,
  },
  {
    id: "dueling-champion",
    title: "Dueling Champion",
    description: "Study a Defense Against the Dark Arts spell.",
    icon: Swords,
    isUnlocked: (state) =>
      (state.character?.spellbook ?? []).some((progress) => {
        if (!progress.studied) return false;
        const spell = spellData.find((s) => s.id === progress.spellId);
        return spell?.category === "Defense Against the Dark Arts";
      }),
  },
  {
    id: "house-pride",
    title: "House Pride",
    description: "Earn 100 points for your house.",
    icon: Trophy,
    isUnlocked: (state) =>
      !!state.character?.house && state.character.housePoints[state.character.house] >= 100,
  },
  {
    id: "wand-chosen",
    title: "Wand Chosen",
    description: "Be chosen by your wand.",
    icon: Wand2,
    isUnlocked: (state) => state.character?.wand != null,
  },
  {
    id: "night-explorer",
    title: "Night Explorer",
    description: "Discover a location while wandering the castle at night.",
    icon: Moon,
    isUnlocked: (state) => (state.character?.discoveredLocations.length ?? 0) > 0 && isNightTime(),
  },
];

export function getUnlockedAchievementIds(state: GameState): string[] {
  return achievements.filter((achievement) => achievement.isUnlocked(state)).map((a) => a.id);
}
