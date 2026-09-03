import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { spells, spellCategories, type SpellCategory } from "../../data/spells";
import { Book } from "../../components/ui/Book";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { CastingModal } from "../../components/spells/CastingModal";
import { getMasteryLevel } from "../../utils/spellMastery";

const orderedSpells = spellCategories.flatMap((category) =>
  spells.filter((spell) => spell.category === category)
);

export function SpellsPage() {
  const { state } = useGame();
  const [pageIndex, setPageIndex] = useState(0);
  const [casting, setCasting] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setPageIndex((i) => Math.min(orderedSpells.length - 1, i + 1));
      } else if (event.key === "ArrowLeft") {
        setPageIndex((i) => Math.max(0, i - 1));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!state.character) return null;
  const character = state.character;

  const currentSpell = orderedSpells[pageIndex];
  const progress = character.spellbook.find((s) => s.spellId === currentSpell.id);
  const mastery = progress?.mastery ?? 0;
  const unlocked = currentSpell.requiredYear <= character.year || progress?.unlocked === true;

  function goToCategory(category: SpellCategory) {
    const index = orderedSpells.findIndex((s) => s.category === category);
    if (index >= 0) setPageIndex(index);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-6">🪄 Spellbook</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {spellCategories.map((category) => (
          <button
            key={category}
            onClick={() => goToCategory(category)}
            aria-pressed={currentSpell.category === category}
            className={`px-3 py-1.5 text-xs uppercase tracking-wide rounded-sm border transition-colors ${
              currentSpell.category === category
                ? "border-gold text-gold-bright bg-gold/10"
                : "border-parchment-dim/25 text-parchment-dim hover:border-gold/50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <Book
        transitionKey={currentSpell.id}
        pageLabel={`Page ${pageIndex + 1} of ${orderedSpells.length}`}
        canPrev={pageIndex > 0}
        canNext={pageIndex < orderedSpells.length - 1}
        onPrev={() => setPageIndex((i) => Math.max(0, i - 1))}
        onNext={() => setPageIndex((i) => Math.min(orderedSpells.length - 1, i + 1))}
        left={
          <>
            <p className="text-xs uppercase tracking-wide text-parchment-dim mb-2">
              {currentSpell.category}
            </p>
            <h2 className="font-display text-3xl text-gold-bright mb-2">{currentSpell.name}</h2>
            <p className="text-parchment-dim italic text-sm mb-6">"{currentSpell.incantation}"</p>

            <div className="mt-auto flex flex-col gap-2 text-sm">
              <Row
                label="Difficulty"
                value={"★".repeat(currentSpell.difficulty) + "☆".repeat(5 - currentSpell.difficulty)}
              />
              <Row label="Mana Cost" value={String(currentSpell.manaCost)} />
              <Row label="Unlocks" value={`Year ${currentSpell.requiredYear}`} />
            </div>
          </>
        }
        right={
          unlocked ? (
            <>
              <p className="text-parchment-dim text-sm leading-relaxed mb-6">
                {currentSpell.description}
              </p>

              <div className="mt-auto">
                <div className="mb-4">
                  <ProgressBar value={mastery} label={getMasteryLevel(mastery)} colorClass="bg-gold" />
                </div>
                <Button onClick={() => setCasting(true)} className="w-full">
                  Cast
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <Lock size={28} className="text-parchment-dim" />
              <p className="text-parchment-dim text-sm">
                This page is sealed until Year {currentSpell.requiredYear}.
              </p>
            </div>
          )
        }
      />

      {casting && (
        <CastingModal spell={currentSpell} mastery={mastery} onClose={() => setCasting(false)} />
      )}
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
