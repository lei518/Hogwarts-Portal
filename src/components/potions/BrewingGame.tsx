import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Potion } from "../../data/potions";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { useGame } from "../../context/GameContext";
import { getBrewQuality, getBrewRewards } from "../../utils/potionCalculator";
import { checkIngredientSelection, getIngredientPool } from "../../utils/ingredientQuiz";
import { playFailureSound, playSuccessSound } from "../../utils/sound";

interface BrewingGameProps {
  potion: Potion;
  onClose: () => void;
}

type Stage = "ingredients" | "ingredientResult" | "heat" | "stir" | "wait" | "result";

const HEAT_TARGET = 75;
const STIR_TARGET = 50;
const MAX_INGREDIENT_QTY = 6;

export function BrewingGame({ potion, onClose }: BrewingGameProps) {
  const { state, dispatch } = useGame();
  const [stage, setStage] = useState<Stage>("ingredients");

  const pool = useMemo(() => getIngredientPool(potion, 3), [potion]);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [ingredientCheck, setIngredientCheck] = useState<ReturnType<
    typeof checkIngredientSelection
  > | null>(null);

  const [temperature, setTemperature] = useState(0);
  const [heatScore, setHeatScore] = useState<number | null>(null);

  const [stirPosition, setStirPosition] = useState(0);
  const [stirScore, setStirScore] = useState<number | null>(null);

  const [waitProgress, setWaitProgress] = useState(0);

  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const resultDispatched = useRef(false);

  // Heat stage: temperature climbs in a sawtooth pattern until the user locks it in.
  useEffect(() => {
    if (stage !== "heat" || reducedMotion) return;
    const interval = setInterval(() => {
      setTemperature((t) => (t >= 100 ? 0 : t + 3));
    }, 90);
    return () => clearInterval(interval);
  }, [stage, reducedMotion]);

  // Stir stage: indicator sweeps back and forth.
  useEffect(() => {
    if (stage !== "stir" || reducedMotion) return;
    let direction = 1;
    const interval = setInterval(() => {
      setStirPosition((p) => {
        let next = p + direction * 4;
        if (next >= 100) {
          next = 100;
          direction = -1;
        } else if (next <= 0) {
          next = 0;
          direction = 1;
        }
        return next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [stage, reducedMotion]);

  // Wait stage: simple progress animation, then auto-advance.
  useEffect(() => {
    if (stage !== "wait") return;
    if (reducedMotion) {
      setStage("result");
      return;
    }
    const interval = setInterval(() => {
      setWaitProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setStage("result");
          return 100;
        }
        return p + 4;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [stage, reducedMotion]);

  const ingredientScore = ingredientCheck?.score ?? 0.7;
  const finalHeatScore = heatScore ?? 75;
  const finalStirScore = stirScore ?? 75;
  const overallScore = ingredientScore * 100 * 0.4 + finalHeatScore * 0.3 + finalStirScore * 0.3;
  const quality = getBrewQuality(overallScore);
  const rewards = getBrewRewards(quality, potion.difficulty);

  useEffect(() => {
    if (stage !== "result" || resultDispatched.current) return;
    resultDispatched.current = true;
    if (rewards.yieldsPotion) {
      playSuccessSound(state.settings.soundEffects);
    } else {
      playFailureSound(state.settings.soundEffects);
    }
    dispatch({
      type: "BREW_POTION",
      payload: {
        potionId: potion.id,
        potionName: potion.name,
        xpAward: rewards.xp,
        masteryGain: rewards.masteryGain,
        yieldsPotion: rewards.yieldsPotion,
        housePointsDelta: rewards.housePointsDelta,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function toggleIngredient(name: string) {
    setSelections((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: 1 };
    });
  }

  function setIngredientQuantity(name: string, qty: number) {
    setSelections((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[name];
      else next[name] = Math.min(MAX_INGREDIENT_QTY, qty);
      return next;
    });
  }

  function handleCheckIngredients() {
    setIngredientCheck(checkIngredientSelection(potion, selections));
    setStage("ingredientResult");
  }

  function lockHeat() {
    const score = Math.max(0, 100 - Math.abs(HEAT_TARGET - temperature) * 4);
    setHeatScore(score);
    setStage("stir");
  }

  function lockStir() {
    const score = Math.max(0, 100 - Math.abs(STIR_TARGET - stirPosition) * 3);
    setStirScore(score);
    setStage("wait");
  }

  function handleReducedMotionContinue(next: Stage) {
    if (next === "stir") setHeatScore(80);
    if (next === "wait") setStirScore(80);
    setStage(next);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-void/85 flex items-center justify-center px-6 py-10 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Brewing ${potion.name}`}
    >
      <div className="relative w-full max-w-md border border-gold/30 rounded-sm bg-ink p-8 my-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-parchment-dim hover:text-gold"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-display text-gold-bright mb-1 text-center">
          🧪 Brewing {potion.name}
        </h2>

        {stage === "ingredients" && (
          <div className="mt-6">
            <p className="text-parchment-dim text-sm text-center mb-4">
              Select the ingredients this recipe calls for, and set each to the right amount.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {pool.map((name) => {
                const qty = selections[name] ?? 0;
                const selected = qty > 0;
                return (
                  <div
                    key={name}
                    className={`rounded-sm border px-3 py-2.5 text-sm transition-colors ${
                      selected
                        ? "border-gold bg-gold/10 text-gold-bright"
                        : "border-parchment-dim/25 text-parchment"
                    }`}
                  >
                    <button
                      onClick={() => toggleIngredient(name)}
                      className="block w-full text-left mb-1.5"
                    >
                      {name}
                    </button>
                    {selected && (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setIngredientQuantity(name, qty - 1)}
                          aria-label={`Decrease ${name}`}
                          className="w-6 h-6 flex items-center justify-center border border-parchment-dim/30 rounded-sm hover:border-gold"
                        >
                          −
                        </button>
                        <span className="w-5 text-center">{qty}</span>
                        <button
                          onClick={() => setIngredientQuantity(name, qty + 1)}
                          aria-label={`Increase ${name}`}
                          className="w-6 h-6 flex items-center justify-center border border-parchment-dim/30 rounded-sm hover:border-gold"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Button onClick={handleCheckIngredients} className="w-full">
              Check Ingredients
            </Button>
          </div>
        )}

        {stage === "ingredientResult" && ingredientCheck && (
          <div className="mt-6">
            <p className="text-parchment-dim text-sm text-center mb-4">
              Ingredient accuracy:{" "}
              <span className="text-gold-bright">{Math.round(ingredientCheck.score * 100)}%</span>
            </p>
            <ul className="flex flex-col gap-1.5 mb-6">
              {ingredientCheck.results.map((r) => (
                <li
                  key={r.name}
                  className={`flex items-center justify-between px-3 py-2 rounded-sm border text-sm ${
                    r.required
                      ? r.correct
                        ? "border-gold/40 bg-gold/5 text-parchment"
                        : "border-parchment-dim/20 text-parchment-dim"
                      : "border-ember/40 bg-ember/5 text-parchment-dim"
                  }`}
                >
                  <span>{r.name}</span>
                  <span className="text-xs">
                    {r.required
                      ? `${r.chosenAmount}/${r.correctAmount}${r.correct ? " ✓" : ""}`
                      : `×${r.chosenAmount} — wrong ingredient`}
                  </span>
                </li>
              ))}
            </ul>
            <Button onClick={() => setStage("heat")} className="w-full">
              Continue to Brewing
            </Button>
          </div>
        )}

        {stage === "heat" && (
          <div className="mt-6 text-center">
            <p className="text-parchment-dim text-sm mb-4">
              Lock the temperature when the gauge sits in the gold zone.
            </p>
            <div className="mb-4">
              <ProgressBar
                value={reducedMotion ? HEAT_TARGET : temperature}
                label="Temperature"
                colorClass="bg-ember"
              />
            </div>
            {reducedMotion ? (
              <Button onClick={() => handleReducedMotionContinue("stir")} className="w-full">
                Heat Cauldron
              </Button>
            ) : (
              <Button onClick={lockHeat} className="w-full">
                Lock Temperature
              </Button>
            )}
          </div>
        )}

        {stage === "stir" && (
          <div className="mt-6 text-center">
            <p className="text-parchment-dim text-sm mb-4">
              Stir now, when the indicator is centered.
            </p>
            <div className="mb-4">
              <ProgressBar
                value={reducedMotion ? STIR_TARGET : stirPosition}
                label="Stirring"
                colorClass="bg-pine"
              />
            </div>
            {reducedMotion ? (
              <Button onClick={() => handleReducedMotionContinue("wait")} className="w-full">
                Stir
              </Button>
            ) : (
              <Button onClick={lockStir} className="w-full">
                Stir Now
              </Button>
            )}
          </div>
        )}

        {stage === "wait" && (
          <div className="mt-6 text-center">
            <p className="text-parchment-dim text-sm mb-4 italic">Letting it simmer...</p>
            <ProgressBar value={waitProgress} colorClass="bg-gold" />
          </div>
        )}

        {stage === "result" && (
          <div className="mt-6 text-center animate-[fadeIn_0.4s_ease-out]">
            <p className="text-3xl font-display text-gold-bright mb-2">{quality}</p>
            <div className="flex flex-col gap-2 text-sm mb-6">
              <Row label="Ingredient Accuracy" value={`${Math.round(ingredientScore * 100)}%`} />
              <Row label="XP" value={`+${rewards.xp}`} />
              <Row label="Potion Mastery" value={`+${rewards.masteryGain}`} />
              {rewards.housePointsDelta > 0 && (
                <Row label="House Points" value={`+${rewards.housePointsDelta}`} />
              )}
              <Row
                label="Potion"
                value={rewards.yieldsPotion ? `${potion.name} added to inventory` : "None produced"}
              />
            </div>
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
