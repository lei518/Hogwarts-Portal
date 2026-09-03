import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useGame } from "../../context/GameContext";
import { getFullName } from "../../utils/character";

const TIPS = [
  { emoji: "🗺️", title: "The Map", body: "Explore Hogwarts and trigger adventures from locations you've discovered." },
  { emoji: "🪄", title: "Spellbook", body: "Cast and master the spells you unlock as you play." },
  { emoji: "🧪", title: "Potions", body: "Brew potions for house points, XP, and useful items." },
  { emoji: "🎒", title: "Inventory", body: "Use items you've collected to restore health and energy." },
];

export function Tutorial() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (!state.character) {
      navigate("/create-character", { replace: true });
    }
  }, [state.character, navigate]);

  if (!state.character) return null;

  function handleFinish() {
    dispatch({ type: "COMPLETE_TUTORIAL" });
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg animate-[fadeIn_0.6s_ease-out]">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-parchment-dim mb-2">
          First Day Tutorial
        </p>
        <h1 className="text-3xl font-display text-gold-bright text-center mb-10">
          Welcome, {getFullName(state.character)}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {TIPS.map(({ emoji, title, body }) => (
            <div
              key={title}
              className="border border-parchment-dim/20 rounded-sm px-4 py-4"
            >
              <p className="text-2xl mb-2">{emoji}</p>
              <p className="font-display text-lg text-parchment mb-1">{title}</p>
              <p className="text-parchment-dim text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button onClick={handleFinish}>Enter the Castle</Button>
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
