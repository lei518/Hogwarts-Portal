import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { QuizStep } from "../../components/ui/QuizStep";
import { sortingQuestions, scoreSorting, houseInfo } from "../../data/sortingQuestions";
import { useGame } from "../../context/GameContext";

const REVEAL_LINES = ["Hmm...", "Interesting...", "Very interesting...", "I know exactly where you belong."];

export function Sorting() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const character = state.character;

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealLineIndex, setRevealLineIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const finished = stepIndex >= sortingQuestions.length;

  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const result = useMemo(
    () => (finished ? scoreSorting(answers) : null),
    [finished, answers]
  );

  const showResult = finished && (reducedMotion || revealed);

  useEffect(() => {
    if (!character) {
      navigate("/create-character", { replace: true });
      return;
    }
    // The ceremony only happens once per character - if it's already been
    // sorted (e.g. the player hit "back" mid-onboarding), skip straight
    // ahead instead of letting them retake it and overwrite the result.
    if (character.sortingCompleted) {
      navigate("/common-room", { replace: true });
    }
  }, [character, navigate]);

  useEffect(() => {
    if (!finished || reducedMotion || revealed) return;

    if (revealLineIndex < REVEAL_LINES.length - 1) {
      const timer = setTimeout(() => setRevealLineIndex((i) => i + 1), 900);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setRevealed(true), 1100);
    return () => clearTimeout(timer);
  }, [finished, revealLineIndex, revealed, reducedMotion]);

  if (!character || character.sortingCompleted) return null;

  function handleSelect(optionId: string) {
    const question = sortingQuestions[stepIndex];
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    setStepIndex((i) => i + 1);
  }

  function handleContinue() {
    if (!result) return;
    // Written together so the assignment and the "done, forever" flag land
    // in the same update - the house becomes permanent from this point on;
    // nothing in the app offers a way to re-sort or override it afterward.
    dispatch({
      type: "UPDATE_CHARACTER",
      payload: { house: result.house, sortingCompleted: true },
    });
    navigate("/common-room");
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      {!finished && (
        <>
          <h1 className="text-xl text-parchment-dim mb-8 tracking-[0.2em] uppercase">
            The Sorting Hat
          </h1>
          <QuizStep
            stepNumber={stepIndex + 1}
            totalSteps={sortingQuestions.length}
            scenario={sortingQuestions[stepIndex].scenario}
            prompt={sortingQuestions[stepIndex].prompt}
            options={sortingQuestions[stepIndex].options}
            onSelect={handleSelect}
          />
        </>
      )}

      {finished && !showResult && (
        <p className="text-2xl md:text-3xl font-display italic text-gold-bright text-center animate-pulse">
          {REVEAL_LINES[revealLineIndex]}
        </p>
      )}

      {showResult && result && (
        <div className="flex flex-col items-center text-center animate-[fadeIn_0.6s_ease-out]">
          <span className="text-6xl mb-4">{houseInfo[result.house].emoji}</span>
          <h2
            className="text-5xl md:text-6xl font-display font-semibold mb-6 tracking-wide"
            style={{ color: houseInfo[result.house].colors.secondary }}
          >
            {result.house.toUpperCase()}!
          </h2>
          <p className="max-w-md text-parchment-dim leading-relaxed mb-6">
            {houseInfo[result.house].description}
          </p>
          <div className="flex gap-3 mb-8">
            {houseInfo[result.house].strengths.map((strength) => (
              <span
                key={strength}
                className="px-3 py-1 text-xs uppercase tracking-wide border border-parchment-dim/30 rounded-full text-parchment-dim"
              >
                {strength}
              </span>
            ))}
          </div>
          <Button onClick={handleContinue}>Find Your Common Room</Button>
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
