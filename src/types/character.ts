import type {
  House,
  Patronus,
  PotionProgress,
  Quest,
  SpellProgress,
  Trait,
  Wand,
} from "./game";
import type { HousePointAward, PersonalNote, Reminder } from "./campusLife";

export type Gender = "female" | "male" | "non-binary" | "unspecified";

// Obtained later (not chosen at creation) - see house/wand/patronus below.
export type BloodStatus = "Pure-blood" | "Half-blood" | "Muggle-born";

export interface Appearance {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
}

export const DEFAULT_APPEARANCE: Appearance = {
  skinTone: "Medium",
  hairStyle: "Short",
  hairColor: "Brown",
  eyeColor: "Brown",
};

// The character model is intentionally one flat interface, grouped by
// comment rather than nested sub-objects, so future additions (statistics,
// equipment, cosmetics, ...) are just another field in the right group
// instead of a reshuffle. Everything here belongs to the character, not the
// account - see types/account.ts for what stays account-level.
export interface Character {
  // --- Identity: captured at creation, rarely changes ---
  firstName: string;
  lastName: string;
  nickname?: string;
  age?: number;
  gender: Gender;
  appearance: Appearance;
  traits: Trait[];

  // --- Progression: auto-initialized, advances through play ---
  // Phase 3 - Profile Cleanup: level/xp/xpToNextLevel/coins/health/maxHealth
  // are gone (RPG progression/combat stats, not a university identity).
  // energy/maxEnergy (Spellbook's mana cost) and knowledge (Library's study
  // reward) stay - both are live inputs to features this phase doesn't
  // touch, not idle stat-sheet flavor.
  year: number;
  energy: number;
  maxEnergy: number;
  knowledge: number;

  // --- Unlockable through the onboarding ceremony: null until then ---
  house: House | null;
  wand: Wand | null;
  bloodStatus: BloodStatus | null;

  // --- Unlocked later in a student's education (Year 5+), not onboarding ---
  patronus: Patronus | null;

  // --- Collections: grow through play, empty/zero at creation ---
  spellbook: SpellProgress[];
  potionProgress: Record<string, PotionProgress>;
  quests: Quest[];
  achievements: string[];
  relationships: Record<string, number>;
  discoveredLocations: string[];
  studiedBooks: string[];
  bookmarkedBooks: string[];
  housePoints: Record<House, number>;
  housePointAwards: HousePointAward[];
  personalNotes: PersonalNote[];
  reminders: Reminder[];
  // Phase 2 - assignment submissions are no longer stored on Character: a
  // per-student JSONB field is invisible to the professor who needs to
  // grade it. See the live `assignment_submissions` table
  // (repositories/submissionsRepository.ts) instead.

  // --- Onboarding progress: belongs to this character, not the app ---
  // Year-Based Onboarding (Phase 6L): Character Creation, Acceptance
  // Letter, Hogwarts Express, Common Room, and Tutorial are gone - there
  // is no more multi-step pipeline to track. `sortingCompleted` stays: it
  // still gates the (preserved) Sorting Hat ceremony for Year 1 students,
  // now driven by src/journey/getJourneyStage.ts's year-based rules.
  sortingCompleted: boolean;

  createdAt: string;
}
