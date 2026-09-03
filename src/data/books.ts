export type BookCategory =
  | "Charms"
  | "Potions"
  | "Transfiguration"
  | "Defense Against the Dark Arts"
  | "Herbology"
  | "History of Magic"
  | "Astronomy"
  | "Care of Magical Creatures"
  | "Dark Arts"
  | "Ancient Magic";

export interface Book {
  id: string;
  title: string;
  category: BookCategory;
  description: string;
  knowledgeReward: number;
  unlocksSpellId?: string;
  unlocksLocationId?: string;
}

export const books: Book[] = [
  {
    id: "standard-book-of-spells",
    title: "The Standard Book of Spells, Grade 1",
    category: "Charms",
    description: "The foundational charms text every first-year is issued, covering the basics of wandwork.",
    knowledgeReward: 10,
    unlocksSpellId: "wingardium-leviosa",
  },
  {
    id: "achievements-in-charming",
    title: "Achievements in Charming",
    category: "Charms",
    description: "A history of famous charms and the witches and wizards who invented them.",
    knowledgeReward: 12,
  },
  {
    id: "advanced-potion-making",
    title: "Advanced Potion-Making",
    category: "Potions",
    description: "A dense, technical text on potion theory, favored by serious brewers.",
    knowledgeReward: 15,
  },
  {
    id: "one-thousand-herbs-and-fungi",
    title: "One Thousand Magical Herbs and Fungi",
    category: "Herbology",
    description: "An illustrated reference of magical plants, several of which are best handled with gloves.",
    knowledgeReward: 12,
  },
  {
    id: "defensive-magical-theory",
    title: "Defensive Magical Theory",
    category: "Defense Against the Dark Arts",
    description: "A cautious, textbook-only approach to defense, long on theory and short on practice.",
    knowledgeReward: 10,
  },
  {
    id: "curses-and-counter-curses",
    title: "Curses and Counter-Curses",
    category: "Defense Against the Dark Arts",
    description: "Practical guidance on recognizing and reversing common hexes and jinxes.",
    knowledgeReward: 15,
    unlocksSpellId: "protego",
  },
  {
    id: "beginners-guide-dark-creatures",
    title: "A Beginner's Guide to Dark Creatures",
    category: "Dark Arts",
    description: "An unflinching survey of the more dangerous things sharing the wizarding world.",
    knowledgeReward: 14,
  },
  {
    id: "hogwarts-a-history",
    title: "Hogwarts: A History",
    category: "History of Magic",
    description: "The definitive account of the castle's founding, secrets, and centuries of alterations.",
    knowledgeReward: 12,
    unlocksLocationId: "room-of-requirement",
  },
  {
    id: "fantastic-beasts",
    title: "Fantastic Beasts and Where to Find Them",
    category: "Care of Magical Creatures",
    description: "A comprehensive bestiary of magical creatures found across the world.",
    knowledgeReward: 13,
  },
  {
    id: "unfogging-the-future",
    title: "Charting the Heavens",
    category: "Astronomy",
    description: "A star chart and guide to the movements of celestial bodies visible from the Astronomy Tower.",
    knowledgeReward: 10,
  },
  {
    id: "intermediate-transfiguration",
    title: "Intermediate Transfiguration",
    category: "Transfiguration",
    description: "Building on first-year theory, with an emphasis on precision over power.",
    knowledgeReward: 14,
  },
  {
    id: "ancient-runes-made-easy",
    title: "Ancient Runes Made Easy",
    category: "Ancient Magic",
    description: "An introductory text on the runic alphabets underlying much of old magic.",
    knowledgeReward: 16,
  },
];

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export const bookCategories: BookCategory[] = [
  "Charms",
  "Potions",
  "Transfiguration",
  "Defense Against the Dark Arts",
  "Herbology",
  "History of Magic",
  "Astronomy",
  "Care of Magical Creatures",
  "Dark Arts",
  "Ancient Magic",
];
