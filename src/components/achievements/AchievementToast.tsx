import { X } from "lucide-react";
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
      className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm rounded-lg border border-gold/40 bg-surface px-5 py-4 shadow-xl shadow-black/40 backdrop-blur-sm animate-[toastIn_0.4s_ease-out_forwards]"
    >
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold/10 text-gold-bright shrink-0" aria-hidden="true">
          <achievement.icon size={19} />
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
          <X size={16} />
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
