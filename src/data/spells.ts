export type SpellCategory = "Charms" | "Defense" | "Utility" | "Other";

export interface Spell {
  id: string;
  name: string;
  incantation: string;
  category: SpellCategory;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  manaCost: number;
  requiredYear: number;
  effectColor: string;
}

export const spells: Spell[] = [
  {
    id: "lumos",
    name: "Lumos",
    incantation: "Lumos",
    category: "Charms",
    description: "Lights the tip of the caster's wand, useful in dark corridors and deeper places still.",
    difficulty: 1,
    manaCost: 5,
    requiredYear: 1,
    effectColor: "#e6c568",
  },
  {
    id: "nox",
    name: "Nox",
    incantation: "Nox",
    category: "Charms",
    description: "Extinguishes the light created by Lumos.",
    difficulty: 1,
    manaCost: 5,
    requiredYear: 1,
    effectColor: "#5b5548",
  },
  {
    id: "accio",
    name: "Accio",
    incantation: "Accio",
    category: "Charms",
    description: "Summons an object toward the caster, sometimes at surprising speed.",
    difficulty: 3,
    manaCost: 15,
    requiredYear: 4,
    effectColor: "#c9a646",
  },
  {
    id: "reparo",
    name: "Reparo",
    incantation: "Reparo",
    category: "Charms",
    description: "Mends broken objects, piecing shattered fragments back together.",
    difficulty: 2,
    manaCost: 10,
    requiredYear: 2,
    effectColor: "#8fae8b",
  },
  {
    id: "wingardium-leviosa",
    name: "Wingardium Leviosa",
    incantation: "Wingardium Leviosa",
    category: "Utility",
    description: "Levitates an object into the air. Wrist movement matters more than force.",
    difficulty: 2,
    manaCost: 10,
    requiredYear: 1,
    effectColor: "#9fc4e0",
  },
  {
    id: "alohomora",
    name: "Alohomora",
    incantation: "Alohomora",
    category: "Utility",
    description: "Unlocks non-magically sealed doors and containers.",
    difficulty: 2,
    manaCost: 8,
    requiredYear: 2,
    effectColor: "#c9a646",
  },
  {
    id: "protego",
    name: "Protego",
    incantation: "Protego",
    category: "Defense",
    description: "Conjures a shield that deflects incoming spells and minor physical force.",
    difficulty: 4,
    manaCost: 20,
    requiredYear: 4,
    effectColor: "#6fa8dc",
  },
  {
    id: "expelliarmus",
    name: "Expelliarmus",
    incantation: "Expelliarmus",
    category: "Defense",
    description: "Disarms an opponent, knocking their wand from their grip.",
    difficulty: 3,
    manaCost: 15,
    requiredYear: 3,
    effectColor: "#d3634a",
  },
  {
    id: "stupefy",
    name: "Stupefy",
    incantation: "Stupefy",
    category: "Defense",
    description: "A stunning spell that renders the target briefly unconscious.",
    difficulty: 4,
    manaCost: 22,
    requiredYear: 5,
    effectColor: "#d3a625",
  },
  {
    id: "expecto-patronum",
    name: "Expecto Patronum",
    incantation: "Expecto Patronum",
    category: "Other",
    description: "Conjures a Patronus, a guardian formed from the caster's happiest memory.",
    difficulty: 5,
    manaCost: 35,
    requiredYear: 6,
    effectColor: "#e8e8f0",
  },
  {
    id: "expecto-patronum-corporeal",
    name: "Corporeal Patronus",
    incantation: "Expecto Patronum",
    category: "Other",
    description: "A fully-formed Patronus, taking the shape of the caster's magical spirit animal.",
    difficulty: 5,
    manaCost: 40,
    requiredYear: 7,
    effectColor: "#e8e8f0",
  },
];

export const spellCategories: SpellCategory[] = ["Charms", "Defense", "Utility", "Other"];
