import { DEFAULT_HOUSE_POINTS, type GameState, type House, type Trait } from "../types/game";
import { DEFAULT_APPEARANCE, type Appearance, type Character, type Gender } from "../types/character";

const STARTING_YEAR = 1;
const STARTING_ENERGY = 100;

export interface CreateCharacterInput {
  firstName: string;
  lastName: string;
  nickname?: string;
  age?: number;
  gender?: Gender;
  appearance?: Appearance;
  traits?: Trait[];
  year?: number;
  // Year-Based Onboarding (Phase 6L) - set only for an already-enrolled
  // (Year 2-7) student whose house the Admin assigned at account creation;
  // a Year 1 student's house comes from the Sorting Hat instead, so this
  // stays undefined for them and `createInitialCharacter` leaves
  // `house: null` from getCharacterDefaults().
  house?: House;
}

// Every field a Character can have beyond bare identity, with its safe
// default value. This is the ONE place that list lives - createInitialCharacter
// (brand-new characters) and migrateCharacter (hydrating a character saved
// under an older schema, see below) both build on it, so a future schema
// addition means adding a default here once, not updating two places that
// can drift apart.
function getCharacterDefaults(): Omit<Character, "firstName" | "lastName" | "nickname" | "age" | "createdAt"> {
  return {
    gender: "unspecified",
    appearance: DEFAULT_APPEARANCE,
    traits: [],

    year: STARTING_YEAR,
    energy: STARTING_ENERGY,
    maxEnergy: STARTING_ENERGY,
    knowledge: 0,

    house: null,
    wand: null,
    bloodStatus: null,
    patronus: null,

    spellbook: [],
    potionProgress: {},
    quests: [],
    achievements: [],
    relationships: {},
    discoveredLocations: [],
    studiedBooks: [],
    bookmarkedBooks: [],
    housePoints: { ...DEFAULT_HOUSE_POINTS },
    housePointAwards: [],
    personalNotes: [],
    reminders: [],

    sortingCompleted: false,
  };
}

// The single place a new character comes into existence. Everything not
// supplied gets the "immediately after registration" default: identity
// fields fall back to a sensible placeholder, house/wand/patronus stay
// null until the player unlocks them, and every collection starts empty.
//
// Year-Based Onboarding (Phase 6L): there is no more Character Creation
// page calling this by hand - it's called once, automatically, by
// GameContext.tsx's auto-synthesis effect, fed from the signed-in
// student's own AuthContext profile (display name split into
// firstName/lastName, Admin-assigned year, and - for Year 2-7 - house).
export function createInitialCharacter(input: CreateCharacterInput): Character {
  return {
    ...getCharacterDefaults(),
    firstName: input.firstName,
    lastName: input.lastName,
    nickname: input.nickname,
    age: input.age,
    gender: input.gender ?? "unspecified",
    appearance: input.appearance ?? DEFAULT_APPEARANCE,
    traits: input.traits ?? [],
    year: input.year ?? STARTING_YEAR,
    house: input.house ?? null,
    createdAt: new Date().toISOString(),
  };
}

// Normalizes a character loaded from localStorage or Supabase to the
// current schema. Older saves predate fields added by later milestones
// (housePointAwards, personalNotes, reminders, ...) and simply don't have
// that key - every missing field gets its default here, once, so every
// other consumer in the app (`character.housePointAwards.map(...)`, etc.)
// can keep assuming the field exists rather than defending itself with
// `?.`/`?? []` at every call site.
// Returns null if `raw` isn't recognizable as a character at all.
export function migrateCharacter(raw: Partial<Character> | null | undefined): Character | null {
  if (!raw || typeof raw.firstName !== "string" || typeof raw.lastName !== "string") {
    return null;
  }
  const firstName = raw.firstName;
  const lastName = raw.lastName;
  return {
    ...getCharacterDefaults(),
    ...raw,
    firstName,
    lastName,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

// The two load boundaries (localStorage, Supabase) call this on whatever
// they read before it enters the app - see utils/storage.ts and
// services/supabase.ts. Nowhere else needs to touch a raw/unmigrated
// character.
export function hydrateGameState(state: GameState | null): GameState | null {
  if (!state) return null;
  return { ...state, character: migrateCharacter(state.character) };
}

export function getFullName(character: Pick<Character, "firstName" | "lastName">): string {
  return `${character.firstName} ${character.lastName}`.trim();
}

const YEAR_ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];

export function formatYearOrdinal(year: number): string {
  return YEAR_ORDINALS[year - 1] ?? `${year}th`;
}

// Phase 3 - Profile Cleanup: not a fabricated ID - deterministically derived
// from the student's real Supabase account (their own account creation
// year + a stable slice of their own real user id), the same way a real
// university's ID is an opaque code derived from an internal record rather
// than a second one re-entered by hand.
export function getStudentId(character: Pick<Character, "createdAt">, userId: string): string {
  const admissionYear = new Date(character.createdAt).getFullYear();
  const shortId = userId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `HU-${admissionYear}-${shortId}`;
}

// The creation form and the account-rename flow both still collect a
// single "name" text field - this keeps that one-field UX while the
// underlying model stays split into firstName/lastName.
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: "" };
  }
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}
