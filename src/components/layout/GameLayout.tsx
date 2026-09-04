import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { achievements, type Achievement } from "../../data/achievements";
import { AchievementToast } from "../achievements/AchievementToast";
import { playAchievementSound } from "../../utils/sound";

export function GameLayout() {
  const { state } = useGame();
  const { user } = useAuth();
  const previousAchievements = useRef<string[] | null>(null);
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const previous = previousAchievements.current;
    const characterAchievements = state.character?.achievements ?? [];
    if (previous) {
      const newlyUnlockedId = characterAchievements.find((id) => !previous.includes(id));
      const achievement = achievements.find((a) => a.id === newlyUnlockedId);
      if (achievement) {
        setToastAchievement(achievement);
        playAchievementSound(state.settings.soundEffects);
      }
    }
    previousAchievements.current = characterAchievements;
  }, [state.character?.achievements, state.settings.soundEffects]);

  useEffect(() => {
    if (!toastAchievement) return;
    const timer = setTimeout(() => setToastAchievement(null), 4500);
    return () => clearTimeout(timer);
  }, [toastAchievement]);

  if (!user) {
    return <Navigate to="/authenticate" replace />;
  }

  if (!state.character) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-ink flex">
      <Sidebar character={state.character} />

      <div className="flex-1 min-w-0 pb-16 md:pb-0 flex flex-col">
        <Header />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <BottomNav />
      <AchievementToast
        achievement={toastAchievement}
        onDismiss={() => setToastAchievement(null)}
      />
    </div>
  );
}
