import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Spell } from "../../data/spells";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { useGame } from "../../context/GameContext";
import {
  getEffectiveManaCost,
  getMasteryLevel,
  getSuccessChance,
} from "../../utils/spellMastery";
import { playFailureSound, playSuccessSound } from "../../utils/sound";
import { clamp } from "../../utils/xpSystem";
import { getGesture, type GesturePoint } from "../../data/gestures";
import { getGestureQuality, scoreGesture } from "../../utils/gestureScoring";
import { GestureCanvas } from "./GestureCanvas";

interface CastingModalProps {
  spell: Spell;
  mastery: number;
  onClose: () => void;
}

type Phase = "ready" | "casting" | "result";

interface CastOutcome {
  success: boolean;
  xpAward: number;
  masteryGain: number;
  manaCost: number;
  energyBefore: number;
  energyAfter: number;
  shapeScore: number;
  gestureAttempted: boolean;
}

// A gesture score of 0.5 (the default for "skip"/reduced-motion) reproduces
// these exact numbers, so gesture quality augments the existing mechanics
// rather than replacing them.
const NEUTRAL_GESTURE_SCORE = 0.5;

export function CastingModal({ spell, mastery, onClose }: CastingModalProps) {
  const { state, dispatch } = useGame();
  const [phase, setPhase] = useState<Phase>("ready");
  const [outcome, setOutcome] = useState<CastOutcome | null>(null);

  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const gesture = useMemo(() => getGesture(spell.id), [spell.id]);

  if (!state.character) return null;

  const effectiveManaCost = getEffectiveManaCost(spell.manaCost, mastery);
  const insufficientMana = state.character.energy < effectiveManaCost;

  function handleCast(shapeScore: number, gestureAttempted: boolean) {
    if (!state.character || insufficientMana) return;

    const gestureBonus = (shapeScore - NEUTRAL_GESTURE_SCORE) * 0.3;
    const successChance = clamp(getSuccessChance(mastery) + gestureBonus, 0.05, 0.99);
    const success = Math.random() < successChance;

    const rewardMultiplier = 0.85 + shapeScore * 0.3;
    const xpAward = success ? Math.round((8 + spell.difficulty * 4) * rewardMultiplier) : 2;
    const masteryGain = success
      ? Math.max(1, Math.round((3 + spell.difficulty) * rewardMultiplier))
      : 1;
    const energyBefore = state.character.energy;
    const energyAfter = Math.max(0, energyBefore - effectiveManaCost);

    const result: CastOutcome = {
      success,
      xpAward,
      masteryGain,
      manaCost: effectiveManaCost,
      energyBefore,
      energyAfter,
      shapeScore,
      gestureAttempted,
    };

    dispatch({
      type: "CAST_SPELL",
      payload: {
        spellId: spell.id,
        manaCost: effectiveManaCost,
        xpAward,
        masteryGain,
        success,
      },
    });

    const playResultSound = () =>
      success
        ? playSuccessSound(state.settings.soundEffects)
        : playFailureSound(state.settings.soundEffects);

    if (reducedMotion) {
      setOutcome(result);
      setPhase("result");
      playResultSound();
      return;
    }

    setPhase("casting");
    setTimeout(() => {
      setOutcome(result);
      setPhase("result");
      playResultSound();
    }, 900);
  }

  function handleGestureComplete(points: GesturePoint[]) {
    if (!gesture) return;
    handleCast(scoreGesture(points, gesture.points), true);
  }

  const showGestureCanvas = phase === "ready" && !reducedMotion && !!gesture;

  return (
    <div
      className="fixed inset-0 z-50 bg-void/85 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Cast ${spell.name}`}
    >
      <div className="relative w-full max-w-md border border-gold/30 rounded-sm bg-ink p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-parchment-dim hover:text-gold"
        >
          <X size={18} />
        </button>

        {phase !== "result" && (
          <div className="flex flex-col items-center text-center">
            <span
              className={`text-6xl mb-4 ${phase === "casting" ? "animate-[wandFlick_0.9s_ease-in-out]" : ""}`}
              aria-hidden="true"
            >
              🪄
            </span>

            <h2 className="text-2xl font-display text-gold-bright mb-1">{spell.name}</h2>
            <p className="text-parchment-dim text-sm italic mb-6">"{spell.incantation}"</p>

            {phase === "casting" && (
              <div
                className="w-24 h-24 rounded-full mb-4"
                style={{
                  background: `radial-gradient(circle, ${spell.effectColor}cc 0%, ${spell.effectColor}00 70%)`,
                }}
              />
            )}

            <div className="w-full mb-6">
              <ProgressBar
                value={(state.character.energy / state.character.maxEnergy) * 100}
                label={`Mana ${state.character.energy}/${state.character.maxEnergy}`}
                colorClass="bg-gold"
              />
            </div>

            {insufficientMana && phase === "ready" && (
              <p className="text-ember text-sm mb-4">
                Not enough mana to cast this spell ({effectiveManaCost} required).
              </p>
            )}

            {showGestureCanvas ? (
              <>
                <p className="text-parchment-dim text-xs mb-3">
                  Trace the gesture to cast — a cleaner match improves your odds.
                </p>
                <GestureCanvas
                  gesture={gesture}
                  color={spell.effectColor}
                  disabled={insufficientMana}
                  onComplete={handleGestureComplete}
                />
                <button
                  onClick={() => handleCast(NEUTRAL_GESTURE_SCORE, false)}
                  disabled={insufficientMana}
                  className="mt-4 text-xs text-parchment-dim hover:text-gold-bright underline underline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cast without gesture
                </button>
              </>
            ) : (
              <Button
                onClick={() => handleCast(NEUTRAL_GESTURE_SCORE, false)}
                disabled={phase === "casting" || insufficientMana}
                className="disabled:opacity-40 disabled:cursor-not-allowed w-full"
              >
                {phase === "casting" ? "Casting..." : "Cast"}
              </Button>
            )}
          </div>
        )}

        {phase === "result" && outcome && (
          <div className="flex flex-col items-center text-center animate-[fadeIn_0.4s_ease-out]">
            <p
              className={`text-2xl font-display mb-2 ${
                outcome.success ? "text-gold-bright" : "text-parchment-dim"
              }`}
            >
              {outcome.success ? `✨ ${spell.name}!` : "The spell fizzles."}
            </p>
            <p className="text-parchment-dim text-sm mb-6">
              {outcome.success ? "Spell successfully cast." : "It didn't quite land this time."}
            </p>

            <div className="w-full flex flex-col gap-2 text-sm mb-6">
              <Row label="XP" value={`+${outcome.xpAward}`} />
              <Row label="Spell Mastery" value={`+${outcome.masteryGain}`} />
              <Row
                label="Mana"
                value={`${outcome.energyBefore} → ${outcome.energyAfter}`}
              />
              <Row label="Mastery Level" value={getMasteryLevel(mastery + outcome.masteryGain)} />
              {outcome.gestureAttempted && (
                <Row
                  label="Gesture"
                  value={`${Math.round(outcome.shapeScore * 100)}% — ${getGestureQuality(outcome.shapeScore)}`}
                />
              )}
            </div>

            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes wandFlick {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-12deg); }
          75% { transform: rotate(12deg); }
        }
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
