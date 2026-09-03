import type { Character } from "../types/character";
import type { OwlPostCategory } from "../types/owlPost";
import { getAnnouncement } from "./announcements";
import { getAllAssignments } from "./assignments";
import { getCourse } from "./courses";
import { getProfessor } from "./professors";

// Placeholder Owl Post that appears the moment a real onboarding milestone
// happens, so the inbox never looks empty for a normally-progressing
// student. Each seed has a stable id so GameContext only sends it once per
// character (see the seeding effect there) - this is a content list, not a
// mechanism; the mechanism is SEND_OWL_POST_MESSAGE, which any future
// feature can call the same way.
export interface OwlPostSeed {
  id: string;
  category: OwlPostCategory;
  isEligible: (character: Character) => boolean;
  build: (character: Character) => { sender: string; subject: string; body: string };
}

export const owlPostSeeds: OwlPostSeed[] = [
  {
    id: "seed:acceptance-letter",
    category: "Admissions",
    isEligible: (character) => character.acceptanceLetterViewed,
    build: (character) => ({
      sender: "Hogwarts Admissions Office",
      subject: "Your Acceptance Is Confirmed",
      body: `Dear ${character.firstName}, welcome to Hogwarts School of Witchcraft and Wizardry. We are delighted to confirm your enrollment for Year ${character.year}. Term begins shortly - further instructions will follow by owl.`,
    }),
  },
  {
    id: "seed:sorting",
    category: "House",
    isEligible: (character) => character.sortingCompleted && Boolean(character.house),
    build: (character) => ({
      sender: `${character.house} Head of House`,
      subject: `Welcome to ${character.house}`,
      body: `Congratulations, ${character.firstName}! The Sorting Hat has placed you in ${character.house}. We look forward to seeing you earn points for your house this year.`,
    }),
  },
  {
    // Demonstrates the Announcements -> Owl Post extension point: the
    // message is built straight from School Announcements' own data
    // (data/announcements.ts) rather than a second copy of the text.
    id: "seed:term-begins-announcement",
    category: "School",
    isEligible: (character) => character.tutorialCompleted,
    build: () => {
      const announcement = getAnnouncement("term-begins")!;
      return {
        sender: announcement.author,
        subject: announcement.title,
        body: announcement.body,
      };
    },
  },
  // One seed per Assignment (data/assignments.ts), generated rather than
  // hand-written - this is the Assignments -> Owl Post extension point: a
  // future Professor Portal only has to add an entry to that shared
  // collection, and the "new assignment posted" letter follows automatically.
  ...getAllAssignments().map((assignment): OwlPostSeed => {
    const course = getCourse(assignment.courseId);
    const professor = course ? getProfessor(course.professorId) : undefined;
    return {
      id: `seed:assignment-posted:${assignment.id}`,
      category: "Professors",
      isEligible: (character) => character.year >= assignment.requiredYear,
      build: () => ({
        sender: professor?.name ?? course?.name ?? "Hogwarts Staff",
        subject: `New Assignment: ${assignment.title}`,
        body: `${assignment.description} Due ${assignment.dueDate}.`,
      }),
    };
  }),
];
