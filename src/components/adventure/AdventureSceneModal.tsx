import { useRef, useState } from "react";
import { X } from "lucide-react";
import type { Adventure } from "../../data/adventures";
import { useGame } from "../../context/GameContext";
import { meetsRequirement } from "../../utils/adventureRequirements";
import { students } from "../../data/students";
import { Button } from "../ui/Button";

interface AdventureSceneModalProps {
  adventure: Adventure;
  onClose: () => void;
}

export function AdventureSceneModal({ adventure, onClose }: AdventureSceneModalProps) {
  const { state, dispatch } = useGame();
  const [currentSceneId, setCurrentSceneId] = useState(adventure.startSceneId);
  const dispatchedEndings = useRef<Set<string>>(new Set());

  const currentScene = adventure.scenes[currentSceneId];
  if (!currentScene) return null;

  function choose(nextSceneId: string) {
    setCurrentSceneId(nextSceneId);

    const nextScene = adventure.scenes[nextSceneId];
    if (!nextScene?.isEnding || !nextScene.reward) return;

    const dispatchKey = `${adventure.id}:${nextSceneId}`;
    if (dispatchedEndings.current.has(dispatchKey)) return;
    dispatchedEndings.current.add(dispatchKey);

    dispatch({
      type: "RESOLVE_ADVENTURE_ENDING",
      payload: {
        questId: dispatchKey,
        questTitle: `${adventure.title}: ${nextScene.title}`,
        questDescription: nextScene.text,
        housePoints: nextScene.reward.housePoints,
        knowledge: nextScene.reward.knowledge,
        relationshipChanges: nextScene.reward.relationshipChanges,
        unlocksSpellId: nextScene.reward.unlocksSpellId,
        unlocksLocationId: nextScene.reward.unlocksLocationId,
      },
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-void/85 flex items-center justify-center px-6 py-10 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={adventure.title}
    >
      <div className="relative w-full max-w-lg border border-gold/30 rounded-sm bg-ink p-8 my-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-parchment-dim hover:text-gold"
        >
          <X size={18} />
        </button>

        <p className="text-xs uppercase tracking-[0.2em] text-parchment-dim mb-2">
          {adventure.emoji} {adventure.title}
        </p>
        <h2 className="text-2xl font-display text-gold-bright mb-4">{currentScene.title}</h2>
        <p className="text-parchment leading-relaxed mb-8">{currentScene.text}</p>

        {currentScene.choices && (
          <div className="flex flex-col gap-3">
            {currentScene.choices.map((choice) => {
              const unlocked = meetsRequirement(choice.requirement, state);
              return (
                <button
                  key={choice.id}
                  onClick={unlocked ? () => choose(choice.nextSceneId) : undefined}
                  disabled={!unlocked}
                  className={`text-left px-5 py-3 border rounded-sm transition-colors ${
                    unlocked
                      ? "border-parchment-dim/30 hover:border-gold hover:bg-void/40"
                      : "border-parchment-dim/10 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span className="text-parchment">{choice.label}</span>
                  {!unlocked && choice.requirement && (
                    <span className="block text-xs text-parchment-dim mt-0.5">
                      {choice.requirement.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {currentScene.isEnding && currentScene.reward && (
          <div className="mt-2">
            <div className="flex flex-col gap-2 text-sm mb-6 border-t border-parchment-dim/10 pt-6">
              {currentScene.reward.knowledge !== undefined && (
                <Row label="Knowledge" value={`+${currentScene.reward.knowledge}`} />
              )}
              {currentScene.reward.housePoints !== undefined && (
                <Row
                  label="House Points"
                  value={`${currentScene.reward.housePoints > 0 ? "+" : ""}${currentScene.reward.housePoints}`}
                />
              )}
              {currentScene.reward.relationshipChanges?.map((change) => (
                <Row
                  key={change.studentId}
                  label={students.find((s) => s.id === change.studentId)?.name ?? change.studentId}
                  value={`${change.delta > 0 ? "+" : ""}${change.delta} relationship`}
                />
              ))}
            </div>
            <Button onClick={onClose} className="w-full">
              Return to the Castle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-parchment-dim">{label}</span>
      <span className="text-parchment">{value}</span>
    </div>
  );
}
