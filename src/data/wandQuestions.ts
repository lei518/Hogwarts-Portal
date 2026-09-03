import type { Wand } from "../types/game";

export const WAND_WOODS = [
  "Holly",
  "Ash",
  "Willow",
  "Oak",
  "Vine",
  "Yew",
  "Walnut",
  "Cherry",
  "Maple",
  "Rowan",
] as const;

export const WAND_CORES = ["Phoenix Feather", "Unicorn Hair", "Dragon Heartstring"] as const;

export type WandWood = (typeof WAND_WOODS)[number];
export type WandCore = (typeof WAND_CORES)[number];

export interface WandOption {
  id: string;
  label: string;
  woodScores: Partial<Record<WandWood, number>>;
  coreScores: Partial<Record<WandCore, number>>;
  intensity: number; // drives length, 0-3
  adaptability: number; // drives flexibility, 0-3
}

export interface WandQuestion {
  id: string;
  prompt: string;
  options: WandOption[];
}

export const wandQuestions: WandQuestion[] = [
  {
    id: "w1",
    prompt: "When magic goes wrong around you, what usually caused it?",
    options: [
      { id: "a", label: "A burst of temper I couldn't hold back.", woodScores: { Holly: 3, Cherry: 1 }, coreScores: { "Dragon Heartstring": 2 }, intensity: 3, adaptability: 1 },
      { id: "b", label: "Overthinking a spell until it slipped.", woodScores: { Ash: 2, Walnut: 2 }, coreScores: { "Unicorn Hair": 1, "Phoenix Feather": 1 }, intensity: 1, adaptability: 2 },
      { id: "c", label: "Trying to protect someone too quickly.", woodScores: { Willow: 3, Rowan: 2 }, coreScores: { "Unicorn Hair": 2 }, intensity: 2, adaptability: 2 },
      { id: "d", label: "Rarely — I stay in control.", woodScores: { Oak: 2, Vine: 1 }, coreScores: { "Dragon Heartstring": 1, "Phoenix Feather": 1 }, intensity: 1, adaptability: 1 },
    ],
  },
  {
    id: "w2",
    prompt: "What draws you to magic in the first place?",
    options: [
      { id: "a", label: "The chance to protect what matters to me.", woodScores: { Rowan: 3, Willow: 1 }, coreScores: { "Unicorn Hair": 2 }, intensity: 2, adaptability: 1 },
      { id: "b", label: "The sheer scope of what's possible to learn.", woodScores: { Ash: 2, Walnut: 3 }, coreScores: { "Phoenix Feather": 2 }, intensity: 1, adaptability: 3 },
      { id: "c", label: "The power it gives me over my own life.", woodScores: { Yew: 3, Vine: 2 }, coreScores: { "Dragon Heartstring": 2 }, intensity: 3, adaptability: 1 },
      { id: "d", label: "The way it can bring people together.", woodScores: { Cherry: 2, Maple: 2 }, coreScores: { "Unicorn Hair": 1, "Phoenix Feather": 1 }, intensity: 1, adaptability: 2 },
    ],
  },
  {
    id: "w3",
    prompt: "Pick a place you'd want to be, wand in hand.",
    options: [
      { id: "a", label: "Facing down something dangerous.", woodScores: { Yew: 2, Holly: 2 }, coreScores: { "Dragon Heartstring": 3 }, intensity: 3, adaptability: 1 },
      { id: "b", label: "A quiet room, perfecting one spell.", woodScores: { Walnut: 3, Oak: 1 }, coreScores: { "Unicorn Hair": 2 }, intensity: 1, adaptability: 1 },
      { id: "c", label: "Somewhere new, figuring it out as I go.", woodScores: { Vine: 3, Ash: 1 }, coreScores: { "Phoenix Feather": 3 }, intensity: 2, adaptability: 3 },
      { id: "d", label: "With people I trust, working as a team.", woodScores: { Cherry: 2, Rowan: 2 }, coreScores: { "Unicorn Hair": 1 }, intensity: 1, adaptability: 2 },
    ],
  },
  {
    id: "w4",
    prompt: "How do you handle being told you're wrong?",
    options: [
      { id: "a", label: "I push back until I'm proven wrong.", woodScores: { Oak: 3, Holly: 1 }, coreScores: { "Dragon Heartstring": 1 }, intensity: 2, adaptability: 1 },
      { id: "b", label: "I re-examine everything from scratch.", woodScores: { Ash: 3, Walnut: 1 }, coreScores: { "Phoenix Feather": 1 }, intensity: 1, adaptability: 2 },
      { id: "c", label: "It stings, but I take it well.", woodScores: { Maple: 2, Willow: 1 }, coreScores: { "Unicorn Hair": 2 }, intensity: 1, adaptability: 2 },
      { id: "d", label: "I find where they're wrong instead.", woodScores: { Vine: 2, Yew: 1 }, coreScores: { "Dragon Heartstring": 1 }, intensity: 2, adaptability: 1 },
    ],
  },
  {
    id: "w5",
    prompt: "Which feeling is hardest for you to sit with?",
    options: [
      { id: "a", label: "Helplessness.", woodScores: { Holly: 2, Yew: 2 }, coreScores: { "Dragon Heartstring": 2 }, intensity: 3, adaptability: 1 },
      { id: "b", label: "Not knowing.", woodScores: { Ash: 2, Walnut: 2 }, coreScores: { "Phoenix Feather": 2 }, intensity: 1, adaptability: 2 },
      { id: "c", label: "Being unwanted.", woodScores: { Willow: 2, Cherry: 2 }, coreScores: { "Unicorn Hair": 2 }, intensity: 1, adaptability: 2 },
      { id: "d", label: "Losing control.", woodScores: { Vine: 2, Oak: 2 }, coreScores: { "Dragon Heartstring": 1, "Phoenix Feather": 1 }, intensity: 2, adaptability: 1 },
    ],
  },
  {
    id: "w6",
    prompt: "Your magic works best when you're...",
    options: [
      { id: "a", label: "Under real pressure.", woodScores: { Holly: 2, Vine: 1 }, coreScores: { "Dragon Heartstring": 2 }, intensity: 3, adaptability: 1 },
      { id: "b", label: "Given time to think it through.", woodScores: { Walnut: 2, Ash: 1 }, coreScores: { "Phoenix Feather": 1, "Unicorn Hair": 1 }, intensity: 1, adaptability: 2 },
      { id: "c", label: "Doing it for someone else's sake.", woodScores: { Rowan: 2, Willow: 1 }, coreScores: { "Unicorn Hair": 2 }, intensity: 2, adaptability: 2 },
      { id: "d", label: "Left completely to my own instincts.", woodScores: { Maple: 1, Oak: 2 }, coreScores: { "Phoenix Feather": 1 }, intensity: 2, adaptability: 3 },
    ],
  },
];

const woodAffinities: Record<WandWood, string> = {
  Holly: "defensive and protective magic",
  Ash: "precise, methodical spellwork",
  Willow: "healing and empathetic magic",
  Oak: "steady, powerful magic under pressure",
  Vine: "ambitious, unconventional spellcraft",
  Yew: "high-stakes, transformative magic",
  Walnut: "complex, intellectually demanding spells",
  Cherry: "spells cast in service of others",
  Maple: "adaptive, improvised magic",
  Rowan: "protective and warding magic",
};

export const WAND_FLEXIBILITY_LEVELS = [
  "Rigid",
  "Slightly Yielding",
  "Reasonably Supple",
  "Supple",
  "Surprisingly Swishy",
  "Unbending",
] as const;

export type WandFlexibility = (typeof WAND_FLEXIBILITY_LEVELS)[number];

// Pure and reusable: given a map of questionId -> chosen optionId, derives
// the full Wand model. No React, no side effects - the quiz UI just calls
// this and saves whatever comes back onto the Character.
export function calculateWand(selectedOptionIds: Record<string, string>): Wand {
  const woodTotals: Record<string, number> = {};
  const coreTotals: Record<string, number> = {};
  let intensitySum = 0;
  let adaptabilitySum = 0;
  let answered = 0;

  for (const question of wandQuestions) {
    const chosenId = selectedOptionIds[question.id];
    const option = question.options.find((o) => o.id === chosenId);
    if (!option) continue;
    answered += 1;
    intensitySum += option.intensity;
    adaptabilitySum += option.adaptability;
    for (const [wood, points] of Object.entries(option.woodScores)) {
      woodTotals[wood] = (woodTotals[wood] ?? 0) + (points ?? 0);
    }
    for (const [core, points] of Object.entries(option.coreScores)) {
      coreTotals[core] = (coreTotals[core] ?? 0) + (points ?? 0);
    }
  }

  const sortedWoods = Object.entries(woodTotals).sort((a, b) => b[1] - a[1]);
  const sortedCores = Object.entries(coreTotals).sort((a, b) => b[1] - a[1]);

  const topWood = (sortedWoods[0]?.[0] ?? "Holly") as WandWood;
  const topWoodScore = sortedWoods[0]?.[1] ?? 0;
  const secondWoodScore = sortedWoods[1]?.[1] ?? 0;

  const topCore = (sortedCores[0]?.[0] ?? "Phoenix Feather") as WandCore;

  const avgIntensity = answered ? intensitySum / answered : 1.5;
  const avgAdaptability = answered ? adaptabilitySum / answered : 1.5;

  // length: 9-14.5 inches, driven by intensity
  const lengthInches = Math.round((9 + avgIntensity * 1.6) * 2) / 2;

  // flexibility: bucketed from adaptability, 0-3 -> named levels
  const flexIndex = Math.min(
    WAND_FLEXIBILITY_LEVELS.length - 1,
    Math.round((avgAdaptability / 3) * (WAND_FLEXIBILITY_LEVELS.length - 1))
  );
  const flexibility = WAND_FLEXIBILITY_LEVELS[flexIndex];

  // compatibility: how decisively the top wood won, scaled into a believable range
  const margin = topWoodScore - secondWoodScore;
  const compatibility = Math.max(62, Math.min(98, 68 + margin * 6));

  return {
    wood: topWood,
    core: topCore,
    lengthInches,
    flexibility,
    compatibility: Math.round(compatibility),
    affinityDescription: woodAffinities[topWood],
  };
}
