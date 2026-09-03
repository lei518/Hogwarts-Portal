import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useGame } from "../../context/GameContext";

export function HogwartsExpress() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const character = state.character;

  useEffect(() => {
    if (!character) {
      navigate("/create-character", { replace: true });
      return;
    }
    // This beat only happens once per character - if it's already been
    // seen (e.g. the player hit "back" mid-onboarding), skip straight
    // ahead instead of replaying it.
    if (character.expressJourneyViewed) {
      navigate("/sorting", { replace: true });
    }
  }, [character, navigate]);

  if (!character || character.expressJourneyViewed) return null;

  function handleContinue() {
    dispatch({ type: "UPDATE_CHARACTER", payload: { expressJourneyViewed: true } });
    navigate("/sorting");
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg border border-parchment-dim/25 rounded-sm bg-void/40 px-8 py-10 animate-[fadeIn_0.6s_ease-out]">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-parchment-dim mb-6">
          Platform Nine and Three-Quarters
        </p>

        <h1 className="text-3xl font-display text-gold-bright text-center mb-8">
          The Hogwarts Express
        </h1>

        <div className="font-body text-parchment-dim leading-relaxed space-y-4 mb-10">
          <p>
            Wand in hand, you step through the barrier onto a platform crowded with
            trunks, owls, and students calling out to friends they haven't seen all
            summer. The scarlet steam engine waits at the end of it.
          </p>
          <p>
            Somewhere beyond the window, the country rolls past — hills, lakes,
            and at last a castle lit against the evening sky.
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleContinue}>Arrive at Hogwarts</Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
