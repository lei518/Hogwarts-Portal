// Spell Archive (Phase 4) - a reference collection, not a progression
// system: no difficulty rating, mana cost, or unlock year gates a spell
// from view. `requiredYear` stays only as informational curriculum
// metadata ("taught starting Year X"), never a lock.
export type SpellCategory = "Charms" | "Defense Against the Dark Arts" | "Utility Spells" | "Other";

export interface Spell {
  id: string;
  name: string;
  incantation: string;
  category: SpellCategory;
  description: string;
  requiredYear: number;
  history: string;
  counterSpell?: string;
  commonUses: string;
  relatedSpellIds?: string[];
}

export const spells: Spell[] = [
  {
    id: "lumos",
    name: "Lumos",
    incantation: "Lumos",
    category: "Charms",
    description: "Lights the tip of the caster's wand, useful in dark corridors and deeper places still.",
    requiredYear: 1,
    history:
      "First documented as a practical illumination charm and taught to every first-year cohort since; one of the earliest spells most students learn to cast reliably.",
    counterSpell: "Nox",
    commonUses: "Lighting dim corridors, dungeons, and cupboards without a lantern.",
    relatedSpellIds: ["nox"],
  },
  {
    id: "nox",
    name: "Nox",
    incantation: "Nox",
    category: "Charms",
    description: "Extinguishes the light created by Lumos.",
    requiredYear: 1,
    history: "Developed alongside Lumos as its natural counterpart; the two are taught together from the start.",
    counterSpell: "Lumos",
    commonUses: "Extinguishing wandlight discreetly, often before entering an unlit room unnoticed.",
    relatedSpellIds: ["lumos"],
  },
  {
    id: "accio",
    name: "Accio",
    incantation: "Accio",
    category: "Charms",
    description: "Summons an object toward the caster, sometimes at surprising speed.",
    requiredYear: 4,
    history:
      "A Summoning Charm classified as sufficiently advanced that the Ministry restricts its instruction until a student's fourth year, owing to the risk of a fast-moving object in flight.",
    commonUses: "Retrieving objects from across a room, out of reach, or from a locked container.",
    relatedSpellIds: ["alohomora"],
  },
  {
    id: "reparo",
    name: "Reparo",
    incantation: "Reparo",
    category: "Charms",
    description: "Mends broken objects, piecing shattered fragments back together.",
    requiredYear: 2,
    history: "A Mending Charm in routine use across every household and classroom in the wizarding world.",
    commonUses: "Repairing broken glass, torn parchment, and cracked crockery.",
  },
  {
    id: "wingardium-leviosa",
    name: "Wingardium Leviosa",
    incantation: "Wingardium Leviosa",
    category: "Charms",
    description: "Levitates an object into the air. Wrist movement matters more than force.",
    requiredYear: 1,
    history:
      "One of the first charms taught at Hogwarts, chosen precisely because getting the wrist movement wrong produces a harmless (if occasionally embarrassing) failure.",
    commonUses: "Levitating small objects for transport, demonstration, or a levitation-based task.",
  },
  {
    id: "alohomora",
    name: "Alohomora",
    incantation: "Alohomora",
    category: "Utility Spells",
    description: "Unlocks non-magically sealed doors and containers.",
    requiredYear: 2,
    history:
      "The Unlocking Charm, widely taught but subject to School Policy restrictions outside supervised coursework - see Resources' School Policies.",
    commonUses: "Opening locked doors, trunks, and cabinets that carry no magical ward of their own.",
    relatedSpellIds: ["accio"],
  },
  {
    id: "protego",
    name: "Protego",
    incantation: "Protego",
    category: "Defense Against the Dark Arts",
    description: "Conjures a shield that deflects incoming spells and minor physical force.",
    requiredYear: 4,
    history:
      "The Shield Charm, a core piece of Defence Against the Dark Arts coursework from the year it's introduced onward.",
    counterSpell: "None - Protego is itself a defensive counter to an incoming spell.",
    commonUses: "Blocking an incoming jinx, hex, or curse in a supervised duelling exercise.",
    relatedSpellIds: ["expelliarmus", "stupefy"],
  },
  {
    id: "expelliarmus",
    name: "Expelliarmus",
    incantation: "Expelliarmus",
    category: "Defense Against the Dark Arts",
    description: "Disarms an opponent, knocking their wand from their grip.",
    requiredYear: 3,
    history:
      "The Disarming Charm, the first offensive-defensive spell most students are formally taught, favoured for ending a duel without lasting harm.",
    commonUses: "Ending a duel safely by separating an opponent from their wand.",
    relatedSpellIds: ["protego", "stupefy"],
  },
  {
    id: "stupefy",
    name: "Stupefy",
    incantation: "Stupefy",
    category: "Defense Against the Dark Arts",
    description: "A stunning spell that renders the target briefly unconscious.",
    requiredYear: 5,
    history:
      "The Stunning Spell, introduced later in the Defence Against the Dark Arts curriculum given the greater care its casting and countering both require.",
    counterSpell: "Ennervate",
    commonUses: "Incapacitating a target briefly in a supervised duelling or defence exercise.",
    relatedSpellIds: ["protego", "expelliarmus"],
  },
  {
    id: "expecto-patronum",
    name: "Expecto Patronum",
    incantation: "Expecto Patronum",
    category: "Defense Against the Dark Arts",
    description: "Conjures a Patronus, a guardian formed from the caster's happiest memory.",
    requiredYear: 6,
    history:
      "Widely regarded as one of the most difficult charms in the standard curriculum, taught only once a student's magical control and emotional discipline are considered sufficient.",
    commonUses: "Warding off Dementors and similar Dark creatures; see Resources → Patronus Charm.",
    relatedSpellIds: ["expecto-patronum-corporeal"],
  },
  {
    id: "expecto-patronum-corporeal",
    name: "Corporeal Patronus",
    incantation: "Expecto Patronum",
    category: "Defense Against the Dark Arts",
    description: "A fully-formed Patronus, taking the shape of the caster's magical spirit animal.",
    requiredYear: 7,
    history:
      "The fully realised form of the Patronus Charm - achieved by comparatively few witches and wizards, and taught only to advanced seventh-year students.",
    commonUses: "The strongest known ward against Dementors, taking a form unique to the caster.",
    relatedSpellIds: ["expecto-patronum"],
  },
];

export const spellCategories: SpellCategory[] = ["Charms", "Defense Against the Dark Arts", "Utility Spells", "Other"];

export function getSpell(id: string): Spell | undefined {
  return spells.find((spell) => spell.id === id);
}
