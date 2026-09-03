import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { QuizStep } from "../../components/ui/QuizStep";
import { patronusQuestions, calculatePatronus } from "../../data/patronusQuestions";
import { useGame } from "../../context/GameContext";
import type { Patronus } from "../../types/game";

const PATRONUS_MIN_YEAR = 5;

export function PatronusPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const character = state.character;

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [castVisible, setCastVisible] = useState(false);
  const [result, setResult] = useState<Patronus | null>(null);

  const finished = stepIndex >= patronusQuestions.length;

  useEffect(() => {
    if (!finished || result) return;
    const t1 = setTimeout(() => setCastVisible(true), 200);
    const t2 = setTimeout(() => setResult(calculatePatronus(answers)), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [finished, result, answers]);

  // GameLayout already guarantees a character exists to reach this page at
  // all; this is just the same defense-in-depth every Portal page has.
  if (!character) return null;

  const locked = character.year < PATRONUS_MIN_YEAR;

  if (locked) {
    return (
      <div className="px-4 md:px-8 py-16 max-w-2xl mx-auto text-center">
        <span className="text-5xl mb-4 block">🔒</span>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-3">
          The Patronus Charm
        </h1>
        <p className="text-parchment-dim">
          This is advanced magic, taught starting in a student's fifth year. You'll be
          able to attempt it once you reach Year {PATRONUS_MIN_YEAR} — you're currently in
          Year {character.year}.
        </p>
      </div>
    );
  }

  if (character.patronus) {
    return (
      <div className="px-4 md:px-8 py-16 max-w-md mx-auto text-center">
        <p className="text-parchment-dim mb-2 text-sm uppercase tracking-[0.2em]">
          Your Patronus is
        </p>
        <span className="text-6xl mb-3 block">{character.patronus.icon}</span>
        <h1 className="text-4xl font-display text-gold-bright mb-4 uppercase tracking-wide">
          {character.patronus.name}
        </h1>
        <p className="text-parchment-dim leading-relaxed mb-4">{character.patronus.description}</p>
        {character.patronus.rarity && (
          <span className="px-3 py-1 text-xs uppercase tracking-wide border border-parchment-dim/30 rounded-full text-parchment-dim">
            {character.patronus.rarity}
          </span>
        )}
      </div>
    );
  }

  function handleSelect(optionId: string) {
    const question = patronusQuestions[stepIndex];
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    setStepIndex((i) => i + 1);
  }

  function handleFinish() {
    if (!result) return;
    // Permanent from this point on - nothing in the app offers a way to
    // retake the charm or override the result afterward.
    dispatch({ type: "UPDATE_CHARACTER", payload: { patronus: result } });
    navigate("/character");
  }

  return (
    <div className="px-4 md:px-8 py-10 flex flex-col items-center">
      {!finished && (
        <>
          <h1 className="text-xl text-parchment-dim mb-8 tracking-[0.2em] uppercase">
            The Patronus Charm
          </h1>
          <QuizStep
            stepNumber={stepIndex + 1}
            totalSteps={patronusQuestions.length}
            prompt={patronusQuestions[stepIndex].prompt}
            options={patronusQuestions[stepIndex].options}
            onSelect={handleSelect}
          />
        </>
      )}

      {finished && !result && (
        <div className="flex flex-col items-center text-center">
          {castVisible && (
            <p className="text-3xl font-display italic text-gold-bright mb-4 animate-[fadeIn_0.4s_ease-out]">
              Expecto Patronum!
            </p>
          )}
          <p className="text-2xl tracking-widest text-parchment-dim animate-pulse">✨ ✨ ✨</p>
        </div>
      )}

      {finished && result && (
        <div className="flex flex-col items-center text-center max-w-md animate-[fadeIn_0.6s_ease-out]">
          <p className="text-parchment-dim mb-2 text-sm uppercase tracking-[0.2em]">
            Your Patronus is
          </p>
          <span className="text-6xl mb-3">{result.icon}</span>
          <h2 className="text-4xl font-display text-gold-bright mb-4 uppercase tracking-wide">
            {result.name}
          </h2>
          <p className="text-parchment-dim leading-relaxed mb-6">{result.description}</p>
          {result.rarity && (
            <span className="mb-6 px-3 py-1 text-xs uppercase tracking-wide border border-parchment-dim/30 rounded-full text-parchment-dim">
              {result.rarity}
            </span>
          )}
          <Button onClick={handleFinish}>Save My Patronus</Button>
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
