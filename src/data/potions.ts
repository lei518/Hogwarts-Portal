export interface PotionIngredient {
  name: string;
  amount: number; // quantity for one potion
}

export interface Potion {
  id: string;
  name: string;
  ingredients: PotionIngredient[];
  instructions: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  brewTimeDays: number;
  effects: string;
  requiredYear: number;
}

export const potions: Potion[] = [
  {
    id: "wiggenweld",
    name: "Wiggenweld Potion",
    ingredients: [
      { name: "Dittany", amount: 2 },
      { name: "Wiggentree Bark", amount: 1 },
      { name: "Horklump Juice", amount: 3 },
    ],
    instructions: [
      "Crush the Dittany and add it to the base cauldron water.",
      "Stir in the Wiggentree Bark until the potion turns pale blue.",
      "Add the Horklump Juice and let it simmer.",
    ],
    difficulty: 2,
    brewTimeDays: 1,
    effects: "Restores health and reverses minor magical damage.",
    requiredYear: 2,
  },
  {
    id: "pepperup",
    name: "Pepperup Potion",
    ingredients: [
      { name: "Ginger Root", amount: 2 },
      { name: "Powdered Unicorn Horn", amount: 1 },
      { name: "Peppermint Sprig", amount: 4 },
    ],
    instructions: [
      "Grate the Ginger Root into a pre-heated cauldron.",
      "Sprinkle in the Powdered Unicorn Horn while stirring clockwise.",
      "Add the Peppermint Sprig last and bring to a brief boil.",
    ],
    difficulty: 1,
    brewTimeDays: 1,
    effects: "Cures the common cold, though it leaves the drinker's ears smoking.",
    requiredYear: 1,
  },
  {
    id: "draught-of-living-death",
    name: "Draught of Living Death",
    ingredients: [
      { name: "Sopophorous Bean", amount: 3 },
      { name: "Wormwood", amount: 2 },
      { name: "Valerian Root", amount: 1 },
      { name: "Asphodel", amount: 2 },
    ],
    instructions: [
      "Crush the Sopophorous Bean with the flat of a silver knife.",
      "Add the Wormwood and stir seven times counter-clockwise.",
      "Mix in the Valerian Root, then the Asphodel, in that exact order.",
      "Let the potion rest undisturbed until it turns as black as ink.",
    ],
    difficulty: 5,
    brewTimeDays: 4,
    effects: "Induces a deep, death-like sleep.",
    requiredYear: 6,
  },
  {
    id: "amortentia",
    name: "Amortentia",
    ingredients: [
      { name: "Rose Thorns", amount: 3 },
      { name: "Ashwinder Egg", amount: 1 },
      { name: "Peppermint", amount: 2 },
      { name: "Pearl Dust", amount: 1 },
    ],
    instructions: [
      "Steep the Rose Thorns in the base until the liquid turns a deep pink.",
      "Add the Ashwinder Egg and stir gently to avoid scorching it.",
      "Mix in the Peppermint, then finish with the Pearl Dust for its signature shimmer.",
    ],
    difficulty: 5,
    brewTimeDays: 7,
    effects: "The most powerful love potion in existence. Smells different to everyone who catches its scent.",
    requiredYear: 6,
  },
  {
    id: "felix-felicis",
    name: "Felix Felicis",
    ingredients: [
      { name: "Ashwinder Egg", amount: 2 },
      { name: "Squill Bulb", amount: 3 },
      { name: "Murtlap Tentacle", amount: 1 },
      { name: "Occamy Eggshell", amount: 1 },
    ],
    instructions: [
      "Add the Ashwinder Egg first and let the cauldron simmer for a full lunar cycle.",
      "Stir in the Squill Bulb, one careful turn at a time.",
      "Add the Murtlap Tentacle, followed by the Occamy Eggshell.",
      "Bottle only once the potion turns molten gold.",
    ],
    difficulty: 5,
    brewTimeDays: 30,
    effects: "Liquid luck. The drinker succeeds at everything they attempt for a short time.",
    requiredYear: 6,
  },
  {
    id: "polyjuice",
    name: "Polyjuice Potion",
    ingredients: [
      { name: "Lacewing Flies", amount: 3 },
      { name: "Leeches", amount: 2 },
      { name: "Fluxweed", amount: 1 },
      { name: "Knotgrass", amount: 1 },
      { name: "Boomslang Skin", amount: 1 },
    ],
    instructions: [
      "Add the Lacewing Flies and let them steep for three weeks.",
      "Stir in the Leeches, then the Fluxweed cut at the full moon.",
      "Mix in the Knotgrass, then finally the Boomslang Skin.",
      "The potion is ready once it separates into the drinker's likeness.",
    ],
    difficulty: 5,
    brewTimeDays: 30,
    effects: "Allows the drinker to temporarily take on the appearance of someone else.",
    requiredYear: 7,
  },
];
