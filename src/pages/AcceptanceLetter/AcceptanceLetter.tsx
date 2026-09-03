import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useGame } from "../../context/GameContext";
import { getFullName } from "../../utils/character";

export function AcceptanceLetter() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const character = state.character;

  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Delay (seconds) before each line reveals; ignored entirely when the
  // player prefers reduced motion, in which case everything just appears.
  function reveal(delaySeconds: number) {
    if (reducedMotion) return undefined;
    return { animation: `letterLine 0.6s ease-out ${delaySeconds}s forwards` };
  }

  useEffect(() => {
    if (!character) {
      navigate("/create-character", { replace: true });
      return;
    }
    // This event only happens once per account - if it's already been
    // accepted (e.g. the player hit "back" mid-onboarding), skip straight
    // ahead instead of replaying the letter.
    if (character.acceptanceLetterViewed) {
      navigate("/wand", { replace: true });
    }
  }, [character, navigate]);

  if (!character || character.acceptanceLetterViewed) return null;

  function handleAccept() {
    dispatch({ type: "VIEW_ACCEPTANCE_LETTER" });
    navigate("/wand");
  }

  return (
    <div className="relative min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-20 bg-black pointer-events-none"
          style={{ animation: "letterFadeToBlack 1.1s ease-out forwards" }}
        />
      )}

      <div
        className={`w-full max-w-lg border border-parchment-dim/25 rounded-sm bg-void/40 px-8 py-10 ${
          reducedMotion ? "" : "opacity-0"
        }`}
        style={reducedMotion ? undefined : { animation: "letterReveal 0.9s ease-out 0.5s forwards" }}
      >
        <p className={`text-center text-3xl mb-4 ${reducedMotion ? "" : "opacity-0"}`} style={reveal(0.9)}>
          🦉
        </p>

        <p
          className={`text-center text-xs uppercase tracking-[0.2em] text-parchment-dim mb-6 ${
            reducedMotion ? "" : "opacity-0"
          }`}
          style={reveal(1.05)}
        >
          Hogwarts School of Witchcraft and Wizardry
        </p>

        <h1
          className={`text-3xl font-display text-gold-bright text-center mb-8 ${
            reducedMotion ? "" : "opacity-0"
          }`}
          style={reveal(1.2)}
        >
          Your Letter Has Arrived
        </h1>

        <div className="font-body text-parchment-dim leading-relaxed space-y-4 mb-10">
          <p className={reducedMotion ? "" : "opacity-0"} style={reveal(1.35)}>
            Dear {getFullName(character)},
          </p>
          <p className={reducedMotion ? "" : "opacity-0"} style={reveal(1.5)}>
            We are pleased to inform you that you have a place at Hogwarts School of
            Witchcraft and Wizardry. Please find enclosed a list of all necessary
            equipment for the coming year.
          </p>
          <p className={reducedMotion ? "" : "opacity-0"} style={reveal(1.65)}>
            Term begins the moment you accept. Ollivanders is expecting you first —
            the Sorting Hat can wait a little longer to learn where you truly belong.
          </p>
          <p
            className={`italic text-parchment-dim/80 ${reducedMotion ? "" : "opacity-0"}`}
            style={reveal(1.8)}
          >
            Yours sincerely,
            <br />
            The Deputy Headmistress
          </p>
        </div>

        <div className={`flex justify-center ${reducedMotion ? "" : "opacity-0"}`} style={reveal(1.95)}>
          <Button onClick={handleAccept}>I Accept</Button>
        </div>
      </div>

      <style>{`
        @keyframes letterFadeToBlack {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes letterReveal {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes letterLine {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
