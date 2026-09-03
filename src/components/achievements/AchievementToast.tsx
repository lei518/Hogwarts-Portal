import type { Achievement } from "../../data/achievements";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  if (!achievement) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm rounded-sm border border-gold/40 bg-ink/95 px-5 py-4 shadow-lg backdrop-blur-sm animate-[toastIn_0.4s_ease-out_forwards]"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">
          {achievement.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-gold-bright text-xs uppercase tracking-[0.2em] mb-1">
            Achievement Unlocked
          </p>
          <p className="font-display text-lg text-parchment leading-tight">{achievement.title}</p>
          <p className="text-parchment-dim text-xs mt-1">{achievement.description}</p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss achievement notification"
          className="text-parchment-dim hover:text-gold shrink-0"
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
