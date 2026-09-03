import type { Professor } from "../types/resources";
import type { Course } from "../types/academics";
import { courses } from "./courses";

// Ids are surname-based tokens, chosen once and never re-derived from
// `name` - renaming a professor's display name later doesn't change the id
// anything else references.
export const professors: Professor[] = [
  {
    id: "flitwick",
    name: "Professor Flitwick",
    title: "Charms Professor · Head of Ravenclaw House",
    officeLocation: "Charms Classroom",
    officeHours: "Tuesdays and Thursdays, 4:00 PM – 5:30 PM",
    bio: "A gifted duellist in his youth, now better known for his patience with students who can't quite get a feather to float.",
    researchInterests: ["Charm theory", "Duelling technique"],
  },
  {
    id: "snape",
    name: "Professor Snape",
    title: "Potions Professor · Head of Slytherin House",
    officeLocation: "Potions Classroom",
    officeHours: "Mondays, 6:00 PM – 7:00 PM",
    bio: "Exacting and famously sparing with praise. Students who read the assigned chapter in advance tend to fare better.",
    researchInterests: ["Antidote theory", "Advanced potion-making"],
  },
  {
    id: "sprout",
    name: "Professor Sprout",
    title: "Herbology Professor · Head of Hufflepuff House",
    officeLocation: "Greenhouses",
    officeHours: "Wednesdays, 3:00 PM – 4:30 PM",
    bio: "Warm and unflappable, even around plants that bite. Runs an open-door policy for anyone worried about their grade.",
    researchInterests: ["Magical botany"],
  },
  {
    id: "quirrell",
    name: "Professor Quirrell",
    title: "Defence Against the Dark Arts Professor",
    officeLocation: "Defence Against the Dark Arts Classroom",
    officeHours: "By appointment",
    bio: "New to the post this year. Lessons are heavier on theory than most students would prefer.",
  },
  {
    id: "sinistra",
    name: "Professor Sinistra",
    title: "Astronomy Professor",
    officeLocation: "Astronomy Tower",
    officeHours: "After scheduled Astronomy lessons",
    bio: "Keeps unusual hours by necessity. Happy to point out a constellation or two if you're up there anyway.",
    researchInterests: ["Celestial navigation"],
  },
  {
    id: "binns",
    name: "Professor Binns",
    title: "History of Magic Professor",
    officeLocation: "History of Magic Classroom",
    officeHours: "Not currently held",
    bio: "The only member of staff who is a ghost, having never quite noticed his own death. Lessons are thorough, if monotone.",
  },
  {
    id: "hooch",
    name: "Madam Hooch",
    title: "Flying Instructor",
    officeLocation: "Quidditch Pitch",
    officeHours: "During scheduled Flying lessons",
    bio: "Sharp-eyed and no-nonsense. Has seen every way a first-year can fall off a broom and remains unfazed by all of them.",
  },
];

export function getProfessor(id: string): Professor | undefined {
  return professors.find((professor) => professor.id === id);
}

// The inverse of Course.professorId - computed, not stored, so the
// relationship only has one place it can drift out of sync.
export function getCoursesForProfessor(professorId: string): Course[] {
  return courses.filter((course) => course.professorId === professorId);
}
