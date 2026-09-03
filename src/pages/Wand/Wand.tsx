import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { QuizStep } from "../../components/ui/QuizStep";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { wandQuestions, calculateWand } from "../../data/wandQuestions";
import type { Wand } from "../../types/game";
import { useGame } from "../../context/GameContext";

export function WandPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const character = state.character;

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [wand, setWand] = useState<Wand | null>(null);
  const [barValue, setBarValue] = useState(0);

  const finished = stepIndex >= wandQuestions.length;

  useEffect(() => {
    if (!character) {
      navigate("/create-character", { replace: true });
      return;
    }
    // The ceremony only happens once per character - if a wand has already
    // been chosen (e.g. the player hit "back" mid-onboarding), skip straight
    // ahead instead of letting them retake it and overwrite the result.
    if (character.wand) {
      navigate("/hogwarts-express", { replace: true });
    }
  }, [character, navigate]);

  useEffect(() => {
    if (!finished || wand) return;
    const result = calculateWand(answers);
    const timer = setTimeout(() => setWand(result), 400);
    return () => clearTimeout(timer);
  }, [finished, wand, answers]);

  useEffect(() => {
    if (!wand) return;
    const timer = setTimeout(() => setBarValue(wand.compatibility), 150);
    return () => clearTimeout(timer);
  }, [wand]);

  if (!character || character.wand) return null;

  function handleSelect(optionId: string) {
    const question = wandQuestions[stepIndex];
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    setStepIndex((i) => i + 1);
  }

  function handleContinue() {
    if (!wand) return;
    // The wand becomes permanent from this point on - nothing in the app
    // offers a way to retake the ceremony or override the result afterward.
    dispatch({ type: "UPDATE_CHARACTER", payload: { wand } });
    navigate("/hogwarts-express");
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      {!finished && (
        <>
          <h1 className="text-xl text-parchment-dim mb-8 tracking-[0.2em] uppercase">
            Finding Your Wand
          </h1>
          <QuizStep
            stepNumber={stepIndex + 1}
            totalSteps={wandQuestions.length}
            prompt={wandQuestions[stepIndex].prompt}
            options={wandQuestions[stepIndex].options}
            onSelect={handleSelect}
          />
        </>
      )}

      {finished && !wand && (
        <p className="text-2xl font-display italic text-gold-bright animate-pulse">
          The wand chooses the wizard...
        </p>
      )}

      {finished && wand && (
        <div className="flex flex-col items-center text-center max-w-md animate-[fadeIn_0.6s_ease-out]">
          <span className="text-5xl mb-4">🪄</span>
          <h2 className="text-3xl font-display text-gold-bright mb-6">Your Wand</h2>

          <div className="w-full grid grid-cols-2 gap-4 text-left mb-6">
            <Stat label="Wood" value={wand.wood} />
            <Stat label="Core" value={wand.core} />
            <Stat label="Length" value={`${wand.lengthInches} inches`} />
            <Stat label="Flexibility" value={wand.flexibility} />
          </div>

          <div className="w-full mb-6">
            <ProgressBar value={barValue} label="Compatibility" colorClass="bg-gold" />
          </div>

          <p className="text-parchment-dim text-sm leading-relaxed mb-8">
            This wand responds especially well to {wand.affinityDescription}.
          </p>

          <Button onClick={handleContinue}>Board the Hogwarts Express</Button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-parchment-dim/20 rounded-sm px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-parchment-dim mb-1">{label}</p>
      <p className="font-display text-lg text-parchment">{value}</p>
    </div>
  );
}
