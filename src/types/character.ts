import type {
  House,
  InventoryItem,
  Patronus,
  PotionProgress,
  Quest,
  SpellProgress,
  Trait,
  Wand,
} from "./game";
import type { OwlPostMessage } from "./owlPost";
import type { HousePointAward, PersonalNote, Reminder } from "./campusLife";
import type { AssignmentSubmission } from "./academics";

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
  year: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  health: number;
  maxHealth: number;
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
  inventory: InventoryItem[];
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
  owlPost: OwlPostMessage[];
  personalNotes: PersonalNote[];
  reminders: Reminder[];
  // Per-student progress, keyed by assignmentId - the Assignment
  // definitions themselves are shared/professor-authored (data/assignments.ts).
  assignmentSubmissions: Record<string, AssignmentSubmission>;

  // --- Onboarding progress: belongs to this character, not the app ---
  acceptanceLetterViewed: boolean;
  expressJourneyViewed: boolean;
  sortingCompleted: boolean;
  commonRoomIntroViewed: boolean;
  tutorialCompleted: boolean;

  createdAt: string;
}
