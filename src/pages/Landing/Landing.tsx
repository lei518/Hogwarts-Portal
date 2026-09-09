import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { CastleSilhouette } from "./CastleSilhouette";
import { AtmosphereField } from "./AtmosphereField";

export function Landing() {
  const navigate = useNavigate();
  const { state } = useGame();
  const { user } = useAuth();

  const hasSave = Boolean(state.character);

  // A returning, signed-in player whose cloud save just hydrated goes straight in.
  useEffect(() => {
    if (user && state.character) navigate("/dashboard");
  }, [user, state.character, navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ink flex flex-col items-center justify-center">
      {/* radial vignette base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, #1c150e 0%, #15100c 55%, #0b0805 100%)",
        }}
      />

      <AtmosphereField />

      <main className="relative z-10 flex flex-col items-center text-center px-6">
        <p className="font-display italic text-parchment-dim text-base md:text-lg mb-3 tracking-wide">
          Your Hogwarts story begins here.
        </p>

        <h1 className="font-display text-gold-bright leading-none">
          <Wand2 size={28} className="mx-auto mb-3 text-gold-bright" aria-hidden="true" />
          <span className="block text-6xl md:text-8xl font-semibold tracking-wide drop-shadow-[0_0_25px_rgba(201,166,70,0.25)]">
            Hogwarts
          </span>
        </h1>

        <p className="mt-4 text-parchment-dim font-body text-sm md:text-base uppercase tracking-[0.2em]">
          School of Witchcraft and Wizardry
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Button variant="primary" onClick={() => navigate("/authenticate")}>
            Begin Journey
          </Button>

          {hasSave && (
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Continue
            </Button>
          )}
        </div>
      </main>

      <CastleSilhouette />
    </div>
  );
}
