import type { Character } from "./character";
import type { WandCore, WandFlexibility, WandWood } from "../data/wandQuestions";
import type { PatronusAnimal, PatronusRarity } from "../data/patronusAnimals";

export type House = "Gryffindor" | "Ravenclaw" | "Hufflepuff" | "Slytherin";

export type Trait =
  | "Brave"
  | "Clever"
  | "Loyal"
  | "Ambitious"
  | "Curious"
  | "Creative"
  | "Kind"
  | "Determined"
  | "Mischievous";

// The canonical Wand model - what the Ollivanders ceremony produces and
// what gets saved onto the Character. `wood`/`core`/`flexibility` are tied
// to the quiz's own vocabulary (data/wandQuestions.ts) rather than loose
// strings, so adding a new wood or core there is automatically reflected
// here with no risk of the two drifting out of sync.
export interface Wand {
  wood: WandWood;
  core: WandCore;
  lengthInches: number;
  flexibility: WandFlexibility;
  compatibility: number; // 0-100
  affinityDescription: string;
}

// The canonical Patronus model - what the Patronus Charm ceremony produces
// and what gets saved onto the Character. `name` is tied to the quiz's own
// vocabulary (data/patronusAnimals.ts) so it can never drift from a form
// that actually has a definition; the rest is read straight from that
// definition (see `buildPatronus`).
export interface Patronus {
  name: PatronusAnimal;
  species: string;
  description: string;
  rarity?: PatronusRarity;
  icon: string;
  animationRef: string;
}

// Phase 4 - Spell Archive: no mastery/unlock progression - a spell is
// either studied or not, the same lightweight "I've read this" bookmark
// character.bookmarkedBooks already uses for the Library.
export interface SpellProgress {
  spellId: string;
  studied: boolean;
  studiedAt?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  rewardHousePoints: number;
}

// Phase 4 - Potion Archive: same studied-only model as SpellProgress above.
export interface PotionProgress {
  potionId: string;
  studied: boolean;
  studiedAt?: string;
}

// One authenticated user owns exactly one character, so a single nullable
// slot (never an array) is the whole relationship - see also Supabase's
// `saves.user_id` primary key, which enforces the same 1:1 at the DB level.
export interface GameState {
  character: Character | null;
  settings: GameSettings;
}

export interface GameSettings {
  soundEffects: boolean;
  ambientMusic: boolean;
}

export const DEFAULT_HOUSE_POINTS: Record<House, number> = {
  Gryffindor: 0,
  Ravenclaw: 0,
  Hufflepuff: 0,
  Slytherin: 0,
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundEffects: true,
  ambientMusic: false,
};
