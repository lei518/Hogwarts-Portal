import type { InventoryItem } from "../types/game";

export interface ChoiceRequirement {
  type: "spell" | "relationship" | "knowledge";
  id?: string; // spellId, or studentId for relationship
  minValue?: number; // mastery threshold, relationship threshold, or knowledge threshold
  label: string; // human-readable requirement, shown when locked
}

export interface AdventureReward {
  xp?: number;
  housePoints?: number;
  knowledge?: number;
  relationshipChanges?: { studentId: string; delta: number }[];
  inventoryItem?: { name: string; category: InventoryItem["category"]; quantity: number };
  unlocksSpellId?: string;
  unlocksLocationId?: string;
}

export interface AdventureChoice {
  id: string;
  label: string;
  requirement?: ChoiceRequirement;
  nextSceneId: string;
}

export interface AdventureScene {
  id: string;
  title: string;
  text: string;
  choices?: AdventureChoice[];
  reward?: AdventureReward;
  isEnding?: boolean;
}

export interface Adventure {
  id: string;
  title: string;
  description: string;
  requiredYear: number;
  emoji: string;
  startSceneId: string;
  locationId: string; // Map location that triggers this adventure
  scenes: Record<string, AdventureScene>;
}

export const adventures: Adventure[] = [
  {
    id: "after-dark",
    title: "After Dark",
    description: "A quiet corridor. Footsteps that aren't yours.",
    requiredYear: 1,
    emoji: "🌙",
    startSceneId: "corridor",
    locationId: "forbidden-forest",
    scenes: {
      corridor: {
        id: "corridor",
        title: "After Dark",
        text: "You are walking through a quiet Hogwarts corridor. You hear footsteps behind you. What do you do?",
        choices: [
          { id: "turn", label: "Turn around", nextSceneId: "turn-around" },
          {
            id: "lumos",
            label: "Cast Lumos",
            requirement: { type: "spell", id: "lumos", label: "Requires Lumos" },
            nextSceneId: "cast-lumos",
          },
          { id: "hide", label: "Hide", nextSceneId: "hide" },
          { id: "run", label: "Run", nextSceneId: "run" },
        ],
      },
      "turn-around": {
        id: "turn-around",
        title: "A Cat in the Dark",
        text: "You turn quickly. It's just Mrs. Norris, eyes glinting in the dark. Nothing more sinister than a suspicious cat.",
        reward: { xp: 15 },
        isEnding: true,
      },
      "cast-lumos": {
        id: "cast-lumos",
        title: "Lit and Unbothered",
        text: "Your wand tip blazes to life. The corridor is empty — whatever you heard is gone, or was never there at all. Still, better safe than sorry.",
        reward: { xp: 25, knowledge: 5 },
        isEnding: true,
      },
      hide: {
        id: "hide",
        title: "Waiting It Out",
        text: "You duck into a doorway alcove and wait. Footsteps pass without slowing — probably a prefect on rounds. Your heart doesn't slow down nearly as fast as they do.",
        choices: [
          { id: "peek", label: "Peek out", nextSceneId: "hide-peek" },
          { id: "wait", label: "Stay hidden until it's silent", nextSceneId: "hide-wait" },
        ],
      },
      "hide-peek": {
        id: "hide-peek",
        title: "Nearly Caught",
        text: "You peek out just as Professor McGonagall passes. She doesn't appear to notice you — but you swear the corner of her mouth twitches.",
        reward: { xp: 20 },
        isEnding: true,
      },
      "hide-wait": {
        id: "hide-wait",
        title: "Patience Rewarded",
        text: "You wait a long, silent while, and eventually creep out into an empty corridor. Nothing to report — but you didn't get caught either.",
        reward: { xp: 15 },
        isEnding: true,
      },
      run: {
        id: "run",
        title: "Running Blind",
        text: "You bolt. Down one corridor, up a staircase that isn't where it was a moment ago, and straight into someone's shins.",
        choices: [
          { id: "apologize", label: "Apologize immediately", nextSceneId: "run-apologize" },
          { id: "explain", label: "Explain about the footsteps", nextSceneId: "run-explain" },
        ],
      },
      "run-apologize": {
        id: "run-apologize",
        title: "Caught Running",
        text: "It's Professor Flitwick, more amused than annoyed. \"Do slow down in the corridors, won't you?\" He doesn't ask why.",
        reward: { xp: 15, housePoints: -5 },
        isEnding: true,
      },
      "run-explain": {
        id: "run-explain",
        title: "Taken Seriously",
        text: "You explain about the footsteps. Professor Flitwick's expression shifts — he walks you back himself, wand lit, and finds nothing. \"Better to be careful,\" he says, and means it.",
        reward: { xp: 25, housePoints: 10 },
        isEnding: true,
      },
    },
  },
  {
    id: "locked-classroom",
    title: "The Locked Classroom",
    description: "A sealed door on a corridor you don't remember. What's behind it?",
    requiredYear: 1,
    emoji: "🚪",
    startSceneId: "door",
    locationId: "room-of-requirement",
    scenes: {
      door: {
        id: "door",
        title: "The Locked Classroom",
        text: "You discover a locked classroom. What do you do?",
        choices: [
          {
            id: "alohomora",
            label: "Cast Alohomora",
            requirement: { type: "spell", id: "alohomora", label: "Requires Alohomora" },
            nextSceneId: "alohomora-success",
          },
          { id: "search", label: "Search for a key", nextSceneId: "search-key" },
          { id: "library", label: "Check the library", nextSceneId: "check-library" },
          { id: "hermione", label: "Ask Hermione for help", nextSceneId: "ask-hermione" },
        ],
      },
      "alohomora-success": {
        id: "alohomora-success",
        title: "The Ancient Spellbook",
        text: "✨ Alohomora! The lock clicks open. Inside, dust-covered shelves hold what looks like it hasn't been touched in decades. Tucked into a low shelf: an ancient spellbook, and something that feels like it might teach you to shield yourself properly.",
        reward: {
          xp: 30,
          knowledge: 20,
          inventoryItem: { name: "An Ancient Spellbook", category: "Book", quantity: 1 },
          unlocksSpellId: "protego",
        },
        isEnding: true,
      },
      "search-key": {
        id: "search-key",
        title: "No Luck",
        text: "You search every drawer and loose stone you can find. No key turns up, but you do find a dust-choked broom cupboard with absolutely nothing enlightening in it.",
        reward: { xp: 10 },
        isEnding: true,
      },
      "check-library": {
        id: "check-library",
        title: "A Dead End, Almost",
        text: "The library has no record of this particular classroom, but a librarian mentions it was sealed after \"an incident\" decades ago. Interesting, but not exactly a way in.",
        reward: { xp: 15, knowledge: 10 },
        isEnding: true,
      },
      "ask-hermione": {
        id: "ask-hermione",
        title: "A Little Help",
        text: "Hermione arrives, listens to the problem for exactly four seconds, and produces a bent hairpin. \"It's just a Muggle lock underneath the wards,\" she says, already crouched at the keyhole. The lock gives with a soft click. \"You owe me,\" she says, though she looks pleased with herself.",
        reward: {
          xp: 20,
          relationshipChanges: [{ studentId: "hermione-granger", delta: 10 }],
        },
        isEnding: true,
      },
    },
  },
];

export function getAdventure(id: string): Adventure | undefined {
  return adventures.find((a) => a.id === id);
}

export function getAdventureByLocation(locationId: string): Adventure | undefined {
  return adventures.find((a) => a.locationId === locationId);
}
