import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import { Button } from "../../components/ui/Button";
import { Toggle } from "../../components/ui/Toggle";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { AccountSection } from "../../components/settings/AccountSection";
import { loadGameState, saveGameState } from "../../utils/storage";
import { playClickSound } from "../../utils/sound";

type SaveStatus = "idle" | "saved" | "loaded" | "no-save-found";

export function SettingsPage() {
  const { state, dispatch, resetGame } = useGame();
  const navigate = useNavigate();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  function flashStatus(status: SaveStatus) {
    setSaveStatus(status);
    setTimeout(() => setSaveStatus("idle"), 2500);
  }

  function handleSoundEffectsToggle(next: boolean) {
    playClickSound(state.settings.soundEffects);
    dispatch({ type: "UPDATE_SETTINGS", payload: { soundEffects: next } });
  }

  function handleAmbientMusicToggle(next: boolean) {
    playClickSound(state.settings.soundEffects);
    dispatch({ type: "UPDATE_SETTINGS", payload: { ambientMusic: next } });
  }

  function handleSave() {
    saveGameState(state);
    flashStatus("saved");
  }

  function handleLoad() {
    const saved = loadGameState();
    if (!saved) {
      flashStatus("no-save-found");
      return;
    }
    dispatch({ type: "LOAD_STATE", payload: saved });
    flashStatus("loaded");
  }

  function handleReset() {
    setConfirmingReset(false);
    resetGame();
    navigate("/");
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-6">⚙️ Settings</h1>

      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-[0.2em] text-parchment-dim mb-2">Sound</h2>
        <div className="border border-parchment-dim/20 rounded-sm px-5 divide-y divide-parchment-dim/10">
          <Toggle
            label="Sound Effects"
            description="Chimes for spells, achievements, and interactions."
            checked={state.settings.soundEffects}
            onChange={handleSoundEffectsToggle}
          />
          <Toggle
            label="Ambient Music"
            description="A soft background score while you explore the castle."
            checked={state.settings.ambientMusic}
            onChange={handleAmbientMusicToggle}
          />
        </div>
      </section>

      <AccountSection />

      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-[0.2em] text-parchment-dim mb-2">
          Your Save
        </h2>
        <div className="border border-parchment-dim/20 rounded-sm px-5 py-4">
          <p className="text-parchment-dim text-sm mb-4">
            Your progress saves automatically. These buttons let you confirm the save, reload it,
            or start fresh.
          </p>
          <div className="flex flex-wrap gap-3 mb-3">
            <Button variant="secondary" onClick={handleSave}>
              Save Now
            </Button>
            <Button variant="secondary" onClick={handleLoad}>
              Load Last Save
            </Button>
            <Button
              variant="secondary"
              className="border-ember/60! text-ember! hover:border-ember! hover:text-ember!"
              onClick={() => setConfirmingReset(true)}
            >
              Reset Progress
            </Button>
          </div>
          <p role="status" aria-live="polite" className="text-xs text-gold-bright h-4">
            {saveStatus === "saved" && "Progress saved."}
            {saveStatus === "loaded" && "Save loaded."}
            {saveStatus === "no-save-found" && "No saved game was found."}
          </p>
        </div>
      </section>

      {confirmingReset && (
        <ConfirmDialog
          title="Reset your progress?"
          message="This permanently erases your character, spells, potions, and everything else you've earned. This cannot be undone."
          confirmLabel="Reset Everything"
          cancelLabel="Keep Playing"
          onConfirm={handleReset}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </div>
  );
}
