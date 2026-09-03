import type { Potion } from "../data/potions";
import { potions } from "../data/potions";

const allIngredientNames = Array.from(
  new Set(potions.flatMap((p) => p.ingredients.map((i) => i.name)))
);

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Decoys are drawn from ingredients real potions use elsewhere, so they read as
// plausible rather than obviously wrong (e.g. "Peppermint" vs "Peppermint Sprig").
export function getIngredientPool(potion: Potion, decoyCount = 3): string[] {
  const correctNames = potion.ingredients.map((i) => i.name);
  const correctSet = new Set(correctNames);
  const decoyCandidates = shuffle(allIngredientNames.filter((name) => !correctSet.has(name)));
  const decoys = decoyCandidates.slice(0, decoyCount);
  return shuffle([...correctNames, ...decoys]);
}

export interface IngredientCheckResult {
  name: string;
  required: boolean;
  correctAmount: number | null;
  chosenAmount: number;
  correct: boolean;
}

export interface IngredientCheck {
  results: IngredientCheckResult[];
  score: number; // 0-1
}

// Partial credit for near-miss quantities and a capped penalty for decoys, so one
// mistake dents the score without wrecking the whole brew.
export function checkIngredientSelection(
  potion: Potion,
  selections: Record<string, number>
): IngredientCheck {
  const requiredMap = new Map(potion.ingredients.map((i) => [i.name, i.amount]));
  const allNames = new Set([...requiredMap.keys(), ...Object.keys(selections)]);

  const results: IngredientCheckResult[] = [];
  let creditSum = 0;
  let decoyCount = 0;

  for (const name of allNames) {
    const chosenAmount = selections[name] ?? 0;
    const correctAmount = requiredMap.get(name) ?? null;

    if (correctAmount !== null) {
      const credit =
        chosenAmount === 0
          ? 0
          : Math.max(0, 1 - Math.abs(chosenAmount - correctAmount) / correctAmount);
      creditSum += credit;
      results.push({
        name,
        required: true,
        correctAmount,
        chosenAmount,
        correct: chosenAmount === correctAmount,
      });
    } else if (chosenAmount > 0) {
      decoyCount++;
      results.push({ name, required: false, correctAmount: null, chosenAmount, correct: false });
    }
  }

  const correctnessScore = requiredMap.size > 0 ? creditSum / requiredMap.size : 1;
  const decoyPenalty = Math.min(0.5, decoyCount * 0.12);
  const score = Math.max(0, Math.min(1, correctnessScore - decoyPenalty));

  return { results, score };
}
