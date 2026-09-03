import type { House } from "../types/game";

// A single answer choice. `scores` is deliberately a *partial* map so one
// answer can contribute to several houses at once (or just one) - add or
// rebalance point values here without touching any component.
export interface SortingOption {
  id: string;
  label: string;
  scores: Partial<Record<House, number>>;
}

export interface SortingQuestion {
  id: string;
  prompt: string;
  scenario: string;
  options: SortingOption[];
}

// The result of running the ceremony's scoring algorithm - reusable
// wherever the outcome needs to be shown or reasoned about, independent of
// the quiz UI itself.
export interface SortingResult {
  house: House;
  scores: Record<House, number>;
}

// The ceremony should feel like a handful of personality questions, not a
// survey - this range is the contract new questions must stay inside.
export const MIN_SORTING_QUESTIONS = 5;
export const MAX_SORTING_QUESTIONS = 8;

export const sortingQuestions: SortingQuestion[] = [
  {
    id: "q1",
    scenario: "You discover a mysterious object humming faintly with magic.",
    prompt: "What do you do?",
    options: [
      { id: "a", label: "Investigate it immediately.", scores: { Gryffindor: 3, Ravenclaw: 1 } },
      { id: "b", label: "Ask someone knowledgeable first.", scores: { Ravenclaw: 3, Hufflepuff: 1 } },
      { id: "c", label: "Keep it safe until you understand it.", scores: { Hufflepuff: 3, Slytherin: 1 } },
      { id: "d", label: "Look for a way to use it to your advantage.", scores: { Slytherin: 3, Gryffindor: 1 } },
    ],
  },
  {
    id: "q2",
    scenario: "A friend is about to make a decision you know will end badly.",
    prompt: "What do you do?",
    options: [
      { id: "a", label: "Tell them exactly what you think, right now.", scores: { Gryffindor: 3 } },
      { id: "b", label: "Lay out the facts and let them decide.", scores: { Ravenclaw: 3 } },
      { id: "c", label: "Stay close so you can help however it turns out.", scores: { Hufflepuff: 3 } },
      { id: "d", label: "Quietly steer the outcome your own way.", scores: { Slytherin: 3 } },
    ],
  },
  {
    id: "q3",
    scenario: "You're offered a place in an exclusive, prestigious club.",
    prompt: "How do you respond?",
    options: [
      { id: "a", label: "Only if it means something — I don't chase status.", scores: { Gryffindor: 2, Hufflepuff: 1 } },
      { id: "b", label: "I'd want to know what they actually value first.", scores: { Ravenclaw: 3 } },
      { id: "c", label: "I'd rather stay with the people I already trust.", scores: { Hufflepuff: 3 } },
      { id: "d", label: "Of course — doors like that don't open twice.", scores: { Slytherin: 3 } },
    ],
  },
  {
    id: "q4",
    scenario: "It's late, you're exhausted, and there's still work to finish.",
    prompt: "What keeps you going?",
    options: [
      { id: "a", label: "Refusing to quit halfway through.", scores: { Gryffindor: 2, Slytherin: 1 } },
      { id: "b", label: "Curiosity about getting it exactly right.", scores: { Ravenclaw: 3 } },
      { id: "c", label: "Not wanting to let anyone down.", scores: { Hufflepuff: 3 } },
      { id: "d", label: "Knowing what finishing it will get you.", scores: { Slytherin: 3 } },
    ],
  },
  {
    id: "q5",
    scenario: "Choose a place to spend a free afternoon at Hogwarts.",
    prompt: "Where do you go?",
    options: [
      { id: "a", label: "The Quidditch pitch.", scores: { Gryffindor: 3 } },
      { id: "b", label: "The library, several floors deep.", scores: { Ravenclaw: 3 } },
      { id: "c", label: "The kitchens, to help and to talk.", scores: { Hufflepuff: 3 } },
      { id: "d", label: "Wherever the most interesting people are.", scores: { Slytherin: 3 } },
    ],
  },
  {
    id: "q6",
    scenario: "Something you value has been unfairly taken from someone else.",
    prompt: "What matters most to you here?",
    options: [
      { id: "a", label: "Confronting whoever did it, directly.", scores: { Gryffindor: 3 } },
      { id: "b", label: "Understanding exactly what happened and why.", scores: { Ravenclaw: 3 } },
      { id: "c", label: "Making sure the person affected is okay.", scores: { Hufflepuff: 3 } },
      { id: "d", label: "Working out how to fix it without anyone noticing.", scores: { Slytherin: 3 } },
    ],
  },
];

if (import.meta.env.DEV) {
  const count = sortingQuestions.length;
  if (count < MIN_SORTING_QUESTIONS || count > MAX_SORTING_QUESTIONS) {
    console.warn(
      `sortingQuestions has ${count} questions; the Sorting Ceremony expects between ${MIN_SORTING_QUESTIONS} and ${MAX_SORTING_QUESTIONS}.`
    );
  }
}

// Pure and reusable: given a map of questionId -> chosen optionId, tallies
// each house's total and returns the winner. No React, no side effects, so
// it's equally testable on its own or callable from anywhere else that
// needs to reason about a sorting outcome.
export function scoreSorting(selectedOptionIds: Record<string, string>): SortingResult {
  const totals: Record<House, number> = {
    Gryffindor: 0,
    Ravenclaw: 0,
    Hufflepuff: 0,
    Slytherin: 0,
  };

  for (const question of sortingQuestions) {
    const chosenId = selectedOptionIds[question.id];
    const option = question.options.find((o) => o.id === chosenId);
    if (!option) continue;
    for (const [house, points] of Object.entries(option.scores)) {
      totals[house as House] += points ?? 0;
    }
  }

  const house = (Object.keys(totals) as House[]).reduce((best, current) =>
    totals[current] > totals[best] ? current : best
  );

  return { house, scores: totals };
}

export const houseInfo: Record<
  House,
  { emoji: string; description: string; strengths: string[]; colors: { primary: string; secondary: string } }
> = {
  Gryffindor: {
    emoji: "🦁",
    description:
      "You belong among those who value courage above all — students who act first and ask questions later, and who would rather fail bravely than succeed quietly.",
    strengths: ["Courage", "Daring", "Chivalry"],
    colors: { primary: "#740001", secondary: "#d3a625" },
  },
  Ravenclaw: {
    emoji: "🦅",
    description:
      "You belong among those who prize wit and learning — students who would rather understand a thing fully than move on from it quickly.",
    strengths: ["Wisdom", "Wit", "Creativity"],
    colors: { primary: "#0e1a40", secondary: "#946b2d" },
  },
  Hufflepuff: {
    emoji: "🦡",
    description:
      "You belong among those who value loyalty and fairness — students who show up for each other and never treat hard work as beneath them.",
    strengths: ["Loyalty", "Patience", "Fair play"],
    colors: { primary: "#ecb939", secondary: "#0b0b0b" },
  },
  Slytherin: {
    emoji: "🐍",
    description:
      "You belong among those who value ambition and resourcefulness — students who know what they want and are willing to work for it.",
    strengths: ["Ambition", "Cunning", "Resourcefulness"],
    colors: { primary: "#1a472a", secondary: "#aaaaaa" },
  },
};
