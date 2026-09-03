import type { Patronus } from "../types/game";
import { buildPatronus, type PatronusAnimal } from "./patronusAnimals";

// A single answer choice. `scores` is deliberately a *partial* map so one
// answer can contribute to several Patronus forms at once (or just one) -
// add or rebalance point values here without touching any component.
export interface PatronusOption {
  id: string;
  label: string;
  scores: Partial<Record<PatronusAnimal, number>>;
}

export interface PatronusQuestion {
  id: string;
  prompt: string;
  options: PatronusOption[];
}

// The ceremony should feel like a handful of personality questions, not a
// survey - this range is the contract new questions must stay inside.
export const MIN_PATRONUS_QUESTIONS = 5;
export const MAX_PATRONUS_QUESTIONS = 8;

export const patronusQuestions: PatronusQuestion[] = [
  {
    id: "p1",
    prompt: "What does courage look like to you?",
    options: [
      { id: "a", label: "Standing your ground for others.", scores: { Stag: 3, Dog: 2 } },
      { id: "b", label: "Doing the quiet thing no one notices.", scores: { Doe: 3, Otter: 1 } },
      { id: "c", label: "Moving before you've thought it through.", scores: { Hare: 3, Fox: 1 } },
      { id: "d", label: "Refusing to be pushed off your path.", scores: { Wolf: 3, Horse: 1 } },
    ],
  },
  {
    id: "p2",
    prompt: "Pick the memory that feels happiest to you.",
    options: [
      { id: "a", label: "Laughing so hard you couldn't breathe.", scores: { Otter: 3, Swan: 1 } },
      { id: "b", label: "A moment someone trusted you completely.", scores: { Dog: 3, Doe: 1 } },
      { id: "c", label: "Figuring something out no one else could.", scores: { Raven: 3, Fox: 1 } },
      { id: "d", label: "Being somewhere wide open and free.", scores: { Eagle: 3, Horse: 2 } },
    ],
  },
  {
    id: "p3",
    prompt: "How do you move through the world?",
    options: [
      { id: "a", label: "Gracefully, and a little apart from the crowd.", scores: { Swan: 3, Cat: 1 } },
      { id: "b", label: "Watchfully, missing very little.", scores: { Cat: 3, Raven: 1 } },
      { id: "c", label: "Restlessly, always toward something new.", scores: { Hare: 2, Fox: 2 } },
      { id: "d", label: "Steadily, at my own pace.", scores: { Horse: 3, Wolf: 1 } },
    ],
  },
  {
    id: "p4",
    prompt: "What are you most loyal to?",
    options: [
      { id: "a", label: "The people closest to me.", scores: { Dog: 3, Stag: 1 } },
      { id: "b", label: "Whatever I've decided is right.", scores: { Wolf: 2, Eagle: 2 } },
      { id: "c", label: "My own independence.", scores: { Cat: 3, Fox: 1 } },
      { id: "d", label: "The truth, wherever it leads.", scores: { Raven: 3, Doe: 1 } },
    ],
  },
  {
    id: "p5",
    prompt: "Someone underestimates you. What happens next?",
    options: [
      { id: "a", label: "I let them find out the hard way.", scores: { Fox: 3, Wolf: 1 } },
      { id: "b", label: "I prove it without making a scene.", scores: { Doe: 2, Swan: 2 } },
      { id: "c", label: "I don't mind — it works in my favor.", scores: { Cat: 2, Fox: 1 } },
      { id: "d", label: "I rise to it immediately.", scores: { Stag: 2, Eagle: 2 } },
    ],
  },
  {
    id: "p6",
    prompt: "What protects the people you love, in your experience?",
    options: [
      { id: "a", label: "Presence — just being there.", scores: { Dog: 2, Horse: 2 } },
      { id: "b", label: "Vigilance — watching for danger first.", scores: { Eagle: 2, Raven: 2 } },
      { id: "c", label: "Warmth — making hard things easier.", scores: { Otter: 3 } },
      { id: "d", label: "Quiet strength — steady, without needing thanks.", scores: { Doe: 2, Stag: 1 } },
    ],
  },
];

if (import.meta.env.DEV) {
  const count = patronusQuestions.length;
  if (count < MIN_PATRONUS_QUESTIONS || count > MAX_PATRONUS_QUESTIONS) {
    console.warn(
      `patronusQuestions has ${count} questions; the Patronus Ceremony expects between ${MIN_PATRONUS_QUESTIONS} and ${MAX_PATRONUS_QUESTIONS}.`
    );
  }
}

// Pure and reusable: given a map of questionId -> chosen optionId, tallies
// each Patronus form's total and returns the full model for the winner. No
// React, no side effects, so it's equally testable on its own or callable
// from anywhere else that needs to reason about a Patronus outcome.
export function calculatePatronus(selectedOptionIds: Record<string, string>): Patronus {
  const totals: Partial<Record<PatronusAnimal, number>> = {};

  for (const question of patronusQuestions) {
    const chosenId = selectedOptionIds[question.id];
    const option = question.options.find((o) => o.id === chosenId);
    if (!option) continue;
    for (const [animal, points] of Object.entries(option.scores)) {
      totals[animal as PatronusAnimal] = (totals[animal as PatronusAnimal] ?? 0) + (points ?? 0);
    }
  }

  const sorted = Object.entries(totals).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  const animal = (sorted[0]?.[0] ?? "Stag") as PatronusAnimal;

  return buildPatronus(animal);
}
