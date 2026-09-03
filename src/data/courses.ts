import type { Course } from "../types/academics";

// Year 1 courses. Real Hogwarts curriculum, not placeholder content -
// classroom names match data/locations.ts where a matching location exists.
export const courses: Course[] = [
  {
    id: "charms",
    name: "Charms",
    professorId: "flitwick",
    classroom: "Charms Classroom",
    description:
      "The study of imbuing objects and people with useful magical properties, from simple levitation to more advanced enchantments.",
    requiredYear: 1,
    recommendedBookIds: ["standard-book-of-spells", "achievements-in-charming"],
  },
  {
    id: "potions",
    name: "Potions",
    professorId: "snape",
    classroom: "Potions Classroom",
    description:
      "Precise, cauldron-based brewing - measuring ingredients exactly and following method to the letter to produce a working potion.",
    requiredYear: 1,
    recommendedBookIds: ["advanced-potion-making"],
  },
  {
    id: "herbology",
    name: "Herbology",
    professorId: "sprout",
    classroom: "Greenhouses",
    description:
      "The study of magical plants and fungi, and how to grow, handle, and use them safely - some rather more safely than others.",
    requiredYear: 1,
    recommendedBookIds: ["one-thousand-herbs-and-fungi"],
  },
  {
    id: "defence-against-the-dark-arts",
    name: "Defence Against the Dark Arts",
    professorId: "quirrell",
    classroom: "Defence Against the Dark Arts Classroom",
    description:
      "Practical and theoretical training in recognizing and countering dark creatures, curses, and hexes.",
    requiredYear: 1,
    recommendedBookIds: ["defensive-magical-theory", "curses-and-counter-curses"],
  },
  {
    id: "astronomy",
    name: "Astronomy",
    professorId: "sinistra",
    classroom: "Astronomy Tower",
    description:
      "Charting the night sky, the movements of the planets, and their long-recognized significance in magical theory.",
    requiredYear: 1,
    recommendedBookIds: ["unfogging-the-future"],
  },
  {
    id: "history-of-magic",
    name: "History of Magic",
    professorId: "binns",
    classroom: "History of Magic Classroom",
    description:
      "The long and eventful history of the wizarding world, from goblin rebellions to the founding of Hogwarts itself.",
    requiredYear: 1,
    recommendedBookIds: ["hogwarts-a-history"],
  },
  {
    id: "flying",
    name: "Flying",
    professorId: "hooch",
    classroom: "Quidditch Pitch",
    description:
      "Broomstick handling fundamentals - mounting, hovering, and controlled flight, taught to every first year together.",
    requiredYear: 1,
  },
];

export function getCourse(id: string): Course | undefined {
  return courses.find((course) => course.id === id);
}
