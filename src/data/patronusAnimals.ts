import type { Patronus } from "../types/game";

// The full roster of possible Patronus forms. Add a new animal here, give
// it an entry in PATRONUS_DEFINITIONS below (TypeScript will refuse to
// compile until you do), and reference it in any question's `scores` -
// nothing else needs to change.
export const PATRONUS_ANIMALS = [
  "Stag",
  "Doe",
  "Otter",
  "Hare",
  "Wolf",
  "Fox",
  "Cat",
  "Horse",
  "Eagle",
  "Swan",
  "Dog",
  "Raven",
] as const;

export type PatronusAnimal = (typeof PATRONUS_ANIMALS)[number];

export const PATRONUS_RARITIES = ["Common", "Uncommon", "Rare"] as const;
export type PatronusRarity = (typeof PATRONUS_RARITIES)[number];

// Everything about a Patronus form that doesn't depend on who it was cast
// by - kept separate from the quiz so lore/balance edits never touch a
// React component, and separate from `Patronus` itself so a definition can
// be looked up by more than just the animal's own name.
export interface PatronusDefinition {
  species: string;
  description: string;
  icon: string;
  rarity: PatronusRarity;
  animationRef: string;
}

// Only one reveal treatment exists today, so every animal points at it -
// the field is wired up and ready for distinct per-species reveals later
// without requiring one now.
const DEFAULT_ANIMATION_REF = "expecto-patronum";

export const PATRONUS_DEFINITIONS: Record<PatronusAnimal, PatronusDefinition> = {
  Stag: {
    species: "Deer",
    description: "Courage, protection, and leadership define your magical spirit.",
    icon: "🦌",
    rarity: "Uncommon",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Doe: {
    species: "Deer",
    description: "Quiet strength and unwavering loyalty define your magical spirit.",
    icon: "🦌",
    rarity: "Uncommon",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Otter: {
    species: "Otter",
    description: "Warmth, playfulness, and loyalty define your magical spirit.",
    icon: "🦦",
    rarity: "Common",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Hare: {
    species: "Hare",
    description: "Quick instincts and restless energy define your magical spirit.",
    icon: "🐇",
    rarity: "Common",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Wolf: {
    species: "Canine",
    description: "Fierce loyalty and conviction define your magical spirit.",
    icon: "🐺",
    rarity: "Uncommon",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Fox: {
    species: "Canine",
    description: "Cleverness and self-reliance define your magical spirit.",
    icon: "🦊",
    rarity: "Common",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Cat: {
    species: "Feline",
    description: "Independence and quiet perceptiveness define your magical spirit.",
    icon: "🐈‍⬛",
    rarity: "Common",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Horse: {
    species: "Equine",
    description: "Steadiness and quiet freedom define your magical spirit.",
    icon: "🐎",
    rarity: "Common",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Eagle: {
    species: "Bird of Prey",
    description: "Vision, ambition, and clarity define your magical spirit.",
    icon: "🦅",
    rarity: "Uncommon",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Swan: {
    species: "Waterfowl",
    description: "Grace under pressure defines your magical spirit.",
    icon: "🦢",
    rarity: "Rare",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Dog: {
    species: "Canine",
    description: "Devotion and unshakable loyalty define your magical spirit.",
    icon: "🐕",
    rarity: "Common",
    animationRef: DEFAULT_ANIMATION_REF,
  },
  Raven: {
    species: "Corvid",
    description: "Sharp intellect and a hunger for truth define your magical spirit.",
    icon: "🐦‍⬛",
    rarity: "Rare",
    animationRef: DEFAULT_ANIMATION_REF,
  },
};

// The single place an animal turns into the full model that gets saved
// onto the Character.
export function buildPatronus(animal: PatronusAnimal): Patronus {
  const definition = PATRONUS_DEFINITIONS[animal];
  return {
    name: animal,
    species: definition.species,
    description: definition.description,
    rarity: definition.rarity,
    icon: definition.icon,
    animationRef: definition.animationRef,
  };
}
