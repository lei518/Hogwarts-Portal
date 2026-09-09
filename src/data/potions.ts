// Potion Archive (Phase 4) - a laboratory reference, not a brewing
// minigame: no quiz score, difficulty rating, or unlock requirement gates
// a potion from view. `requiredYear` stays only as informational
// curriculum metadata ("taught starting Year X"), never a lock.
export interface PotionIngredient {
  name: string;
  amount: number; // quantity for one potion
}

export interface Potion {
  id: string;
  name: string;
  description: string;
  uses: string;
  ingredients: PotionIngredient[];
  equipment: string[];
  preparation: string[];
  instructions: string[];
  brewTimeDays: number;
  requiredYear: number;
  warnings?: string;
  sideEffects?: string;
  storageInstructions?: string;
  historicalNotes?: string;
  knownDiscoveries?: string;
  famousBrewers?: string;
}

export const potions: Potion[] = [
  {
    id: "wiggenweld",
    name: "Wiggenweld Potion",
    description: "A restorative potion used to recover strength and reverse minor magical damage.",
    uses: "Healing and recovery, most often administered in the Hospital Wing.",
    ingredients: [
      { name: "Dittany", amount: 2 },
      { name: "Wiggentree Bark", amount: 1 },
      { name: "Horklump Juice", amount: 3 },
    ],
    equipment: ["Standard pewter cauldron", "Stirring rod", "Silver knife"],
    preparation: ["Crush the Dittany with the flat of the silver knife before adding it to the cauldron water."],
    instructions: [
      "Crush the Dittany and add it to the base cauldron water.",
      "Stir in the Wiggentree Bark until the potion turns pale blue.",
      "Add the Horklump Juice and let it simmer.",
    ],
    brewTimeDays: 1,
    requiredYear: 2,
    warnings: "Do not substitute fresh Dittany for dried - the potency differs significantly.",
    sideEffects: "None recorded when brewed to standard and dosed correctly.",
    storageInstructions: "Store in a sealed glass phial away from direct light; use within one month.",
    historicalNotes: "A staple of Hospital Wing stores, restocked every term ahead of Quidditch season.",
  },
  {
    id: "pepperup",
    name: "Pepperup Potion",
    description: "Cures the common cold, though it leaves the drinker's ears smoking for a short while.",
    uses: "Treating colds and minor seasonal ailments.",
    ingredients: [
      { name: "Ginger Root", amount: 2 },
      { name: "Powdered Unicorn Horn", amount: 1 },
      { name: "Peppermint Sprig", amount: 4 },
    ],
    equipment: ["Standard pewter cauldron", "Grater", "Stirring rod"],
    preparation: ["Grate the Ginger Root finely before the cauldron is heated."],
    instructions: [
      "Grate the Ginger Root into a pre-heated cauldron.",
      "Sprinkle in the Powdered Unicorn Horn while stirring clockwise.",
      "Add the Peppermint Sprig last and bring to a brief boil.",
    ],
    brewTimeDays: 1,
    requiredYear: 1,
    sideEffects: "Temporary smoke from the ears for up to an hour after drinking.",
    storageInstructions: "Best brewed fresh and used within a few days.",
  },
  {
    id: "draught-of-living-death",
    name: "Draught of Living Death",
    description: "Induces a deep, death-like sleep.",
    uses: "Advanced sleeping draught, studied for its extreme potency rather than routine use.",
    ingredients: [
      { name: "Sopophorous Bean", amount: 3 },
      { name: "Wormwood", amount: 2 },
      { name: "Valerian Root", amount: 1 },
      { name: "Asphodel", amount: 2 },
    ],
    equipment: ["Pewter cauldron", "Silver knife", "Stirring rod"],
    preparation: ["Crush the Sopophorous Bean rather than cutting it, to release its juice fully."],
    instructions: [
      "Crush the Sopophorous Bean with the flat of a silver knife.",
      "Add the Wormwood and stir seven times counter-clockwise.",
      "Mix in the Valerian Root, then the Asphodel, in that exact order.",
      "Let the potion rest undisturbed until it turns as black as ink.",
    ],
    brewTimeDays: 4,
    requiredYear: 6,
    warnings: "One of the most dangerous potions in the standard curriculum - brewed only under direct professor supervision.",
    sideEffects: "A death-like sleep from which the drinker cannot easily be woken.",
    storageInstructions: "Stored under lock in the Potions storeroom, never left unattended.",
    historicalNotes: "Studied for its extraordinary potency rather than brewed routinely.",
  },
  {
    id: "amortentia",
    name: "Amortentia",
    description: "The most powerful love potion in existence. Smells different to everyone who catches its scent.",
    uses: "Studied academically for its properties; not brewed for casual use.",
    ingredients: [
      { name: "Rose Thorns", amount: 3 },
      { name: "Ashwinder Egg", amount: 1 },
      { name: "Peppermint", amount: 2 },
      { name: "Pearl Dust", amount: 1 },
    ],
    equipment: ["Pewter cauldron", "Stirring rod"],
    preparation: ["Steep the Rose Thorns whole; crushing them alters the final scent profile."],
    instructions: [
      "Steep the Rose Thorns in the base until the liquid turns a deep pink.",
      "Add the Ashwinder Egg and stir gently to avoid scorching it.",
      "Mix in the Peppermint, then finish with the Pearl Dust for its signature shimmer.",
    ],
    brewTimeDays: 7,
    requiredYear: 6,
    warnings: "Ministry-regulated; brewing outside a supervised classroom setting is against School Policy.",
    sideEffects: "Produces an intense but entirely artificial infatuation, not genuine affection.",
    storageInstructions: "Stored separately and logged, per Potions Professor policy.",
    historicalNotes: "Recognisable by its distinctive mother-of-pearl sheen and rising steam spirals.",
  },
  {
    id: "felix-felicis",
    name: "Felix Felicis",
    description: "Liquid luck. The drinker succeeds at everything they attempt for a short time.",
    uses: "Studied as one of the most difficult potions in the curriculum; brewing it successfully is itself the achievement.",
    ingredients: [
      { name: "Ashwinder Egg", amount: 2 },
      { name: "Squill Bulb", amount: 3 },
      { name: "Murtlap Tentacle", amount: 1 },
      { name: "Occamy Eggshell", amount: 1 },
    ],
    equipment: ["Pewter cauldron", "Stirring rod", "Sealed storage phial"],
    preparation: ["Ensure all ingredients are fresh - Felix Felicis is unforgiving of substitutions."],
    instructions: [
      "Add the Ashwinder Egg first and let the cauldron simmer for a full lunar cycle.",
      "Stir in the Squill Bulb, one careful turn at a time.",
      "Add the Murtlap Tentacle, followed by the Occamy Eggshell.",
      "Bottle only once the potion turns molten gold.",
    ],
    brewTimeDays: 30,
    requiredYear: 6,
    warnings: "Overuse is toxic and induces recklessness; strictly regulated by the Ministry.",
    sideEffects: "Giddiness and overconfidence if taken in excess.",
    storageInstructions: "Kept in a sealed, labelled phial away from other potions.",
    historicalNotes: "Considered one of the most difficult potions taught at Hogwarts.",
    famousBrewers: "Renowned Potions Masters are typically the only ones able to brew it reliably.",
  },
  {
    id: "polyjuice",
    name: "Polyjuice Potion",
    description: "Allows the drinker to temporarily take on the appearance of someone else.",
    uses: "Studied for its transfiguration-adjacent properties; tightly regulated outside coursework.",
    ingredients: [
      { name: "Lacewing Flies", amount: 3 },
      { name: "Leeches", amount: 2 },
      { name: "Fluxweed", amount: 1 },
      { name: "Knotgrass", amount: 1 },
      { name: "Boomslang Skin", amount: 1 },
    ],
    equipment: ["Pewter cauldron", "Stirring rod", "Sealed storage phial"],
    preparation: ["Fluxweed must be cut precisely at the full moon for the potion to work correctly."],
    instructions: [
      "Add the Lacewing Flies and let them steep for three weeks.",
      "Stir in the Leeches, then the Fluxweed cut at the full moon.",
      "Mix in the Knotgrass, then finally the Boomslang Skin.",
      "The potion is ready once it separates into the drinker's likeness.",
    ],
    brewTimeDays: 30,
    requiredYear: 7,
    warnings: "Requires a physical part of the person being impersonated - a Ministry-regulated ingredient.",
    sideEffects: "Wears off after a fixed duration, sometimes abruptly.",
    storageInstructions: "Never stored pre-mixed with a target's ingredient; combined only immediately before use.",
    historicalNotes: "One of the most complex transfigurative potions in the standard curriculum.",
  },
];

export function getPotion(id: string): Potion | undefined {
  return potions.find((potion) => potion.id === id);
}
