import { useState } from "react";
import { Lock } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { potions } from "../../data/potions";
import { scaleIngredients } from "../../utils/potionCalculator";
import { Book } from "../../components/ui/Book";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { BrewingGame } from "../../components/potions/BrewingGame";

export function PotionsPage() {
  const { state } = useGame();
  const [pageIndex, setPageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [brewing, setBrewing] = useState(false);

  if (!state.character) return null;
  const character = state.character;

  const potion = potions[pageIndex];
  const scaled = scaleIngredients(potion, quantity);
  const progress = character.potionProgress[potion.id];
  const locked = potion.requiredYear > character.year;

  function goToPage(index: number) {
    setPageIndex(index);
    setQuantity(1);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-6">🧪 Potions</h1>

      <Book
        transitionKey={potion.id}
        pageLabel={`Page ${pageIndex + 1} of ${potions.length}`}
        canPrev={pageIndex > 0}
        canNext={pageIndex < potions.length - 1}
        onPrev={() => goToPage(Math.max(0, pageIndex - 1))}
        onNext={() => goToPage(Math.min(potions.length - 1, pageIndex + 1))}
        left={
          <>
            <p className="text-xs uppercase tracking-wide text-parchment-dim mb-2">Potion</p>
            <h2 className="font-display text-3xl text-gold-bright mb-2">{potion.name}</h2>
            <p className="text-parchment-dim text-sm leading-relaxed mb-6">{potion.effects}</p>

            <div className="mt-auto flex flex-col gap-2 text-sm">
              <Row
                label="Difficulty"
                value={"★".repeat(potion.difficulty) + "☆".repeat(5 - potion.difficulty)}
              />
              <Row
                label="Brew Time"
                value={`${potion.brewTimeDays} day${potion.brewTimeDays !== 1 ? "s" : ""}`}
              />
              <Row label="Required Year" value={String(potion.requiredYear)} />
            </div>
          </>
        }
        right={
          locked ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <Lock size={28} className="text-parchment-dim" />
              <p className="text-parchment-dim text-sm">
                You'll need to reach Year {potion.requiredYear} to brew this.
              </p>
            </div>
          ) : (
            <>
              {progress && (
                <div className="mb-4">
                  <ProgressBar
                    value={progress.mastery}
                    label={`Potion Mastery · Brewed ${progress.timesBrewed}×`}
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs uppercase tracking-wide text-parchment-dim mb-1.5">
                  Number of potions
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2 text-parchment"
                />
              </div>

              <p className="text-xs uppercase tracking-wide text-parchment-dim mb-2">
                Ingredients
              </p>
              <ul className="mb-4 flex flex-col gap-1">
                {scaled.map((ing) => (
                  <li key={ing.name} className="flex justify-between text-sm text-parchment">
                    <span>{ing.name}</span>
                    <span className="text-parchment-dim">{ing.amount}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs uppercase tracking-wide text-parchment-dim mb-2">
                Instructions
              </p>
              <ol className="mb-6 flex flex-col gap-1.5 list-decimal list-inside">
                {potion.instructions.map((step, i) => (
                  <li key={i} className="text-parchment-dim text-sm leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>

              <div className="mt-auto">
                <Button onClick={() => setBrewing(true)} className="w-full">
                  Brew
                </Button>
              </div>
            </>
          )
        }
      />

      {brewing && <BrewingGame potion={potion} onClose={() => setBrewing(false)} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-parchment-dim/10 pb-2">
      <span className="text-parchment-dim">{label}</span>
      <span className="text-parchment">{value}</span>
    </div>
  );
}
