import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useGame } from "../../context/GameContext";
import { houseInfo } from "../../data/sortingQuestions";
import type { House } from "../../types/game";

const STARTING_HOUSE_POINTS = 10;

const commonRoomLocations: Record<House, string> = {
  Gryffindor: "behind the portrait of the Fat Lady, high in Gryffindor Tower",
  Ravenclaw: "through a door that only opens once you've answered its riddle",
  Hufflepuff: "down near the kitchens, behind a stack of barrels",
  Slytherin: "in the dungeons, behind a stretch of bare stone wall by the lake",
};

export function CommonRoom() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const character = state.character;

  useEffect(() => {
    if (!character) {
      navigate("/create-character", { replace: true });
      return;
    }
    if (!character.house) {
      navigate("/sorting", { replace: true });
      return;
    }
    // This introduction only happens once per character - if it's already
    // been seen, skip straight ahead instead of replaying it.
    if (character.commonRoomIntroViewed) {
      navigate("/tutorial", { replace: true });
    }
  }, [character, navigate]);

  if (!character || !character.house || character.commonRoomIntroViewed) return null;

  const house = houseInfo[character.house];

  function handleContinue() {
    dispatch({ type: "COMPLETE_COMMON_ROOM_INTRO", payload: { startingHousePoints: STARTING_HOUSE_POINTS } });
    navigate("/tutorial");
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-lg border rounded-sm overflow-hidden animate-[fadeIn_0.6s_ease-out]"
        style={{ borderColor: `${house.colors.secondary}55` }}
      >
        <div
          className="px-8 py-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${house.colors.primary}, ${house.colors.primary}dd)`,
          }}
        >
          <span className="text-5xl mb-3 block">{house.emoji}</span>
          <h1 className="text-3xl font-display text-parchment mb-1">
            Welcome to {character.house}
          </h1>
          <p className="text-parchment/70 text-sm">
            Your common room is {commonRoomLocations[character.house]}.
          </p>
        </div>

        <div className="bg-void/60 px-8 py-8">
          <p className="text-parchment-dim leading-relaxed mb-6">{house.description}</p>
          <p className="text-parchment-dim text-sm leading-relaxed">
            You're not the first to walk through that entrance, and you won't be the
            last — every student in {character.house} has called this room home
            before you. Settle in; it's yours now too.
          </p>
        </div>
      </div>

      <p className="text-gold-bright text-sm mt-6">+{STARTING_HOUSE_POINTS} house points for arriving</p>

      <Button className="mt-6" onClick={handleContinue}>
        Continue to Your First Day
      </Button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
