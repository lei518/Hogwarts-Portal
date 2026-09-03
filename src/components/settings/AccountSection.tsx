import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useGame, type SyncStatus } from "../../context/GameContext";
import { Button } from "../ui/Button";
import { getFullName, splitFullName } from "../../utils/character";

const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  idle: "",
  saving: "Syncing...",
  saved: "☁️ Saved to cloud",
  offline: "Offline — saved locally",
};

export function AccountSection() {
  const navigate = useNavigate();
  const { user, profile, signOut, renameDisplayName } = useAuth();
  const { state, dispatch, syncStatus } = useGame();
  const [nameInput, setNameInput] = useState(state.character ? getFullName(state.character) : "");
  const [renaming, setRenaming] = useState(false);
  const [renameMessage, setRenameMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!user) {
    return (
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-[0.2em] text-parchment-dim mb-2">Account</h2>
        <div className="border border-parchment-dim/20 rounded-sm px-5 py-4">
          <p className="text-parchment-dim text-sm mb-4">
            Sign in to save your progress to the cloud and pick it up on any device.
          </p>
          <Button variant="secondary" onClick={() => navigate("/authenticate")}>
            Sign In / Create Account
          </Button>
        </div>
      </section>
    );
  }

  const currentFullName = state.character ? getFullName(state.character) : "";

  async function handleRename() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === currentFullName) return;

    setRenaming(true);
    setRenameMessage(null);
    const result = await renameDisplayName(trimmed);
    setRenaming(false);

    if (result.success) {
      dispatch({ type: "UPDATE_CHARACTER", payload: splitFullName(trimmed) });
      setRenameMessage({ type: "success", text: "Display name updated." });
    } else {
      const dateStr = result.nextEligibleAt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setRenameMessage({
        type: "error",
        text: `You can change your display name again on ${dateStr}.`,
      });
    }
  }

  return (
    <section className="mb-8">
      <h2 className="text-sm uppercase tracking-[0.2em] text-parchment-dim mb-2">Account</h2>
      <div className="border border-parchment-dim/20 rounded-sm px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-parchment text-sm">{user.email}</p>
            {SYNC_STATUS_LABEL[syncStatus] && (
              <p className="text-parchment-dim text-xs mt-0.5">{SYNC_STATUS_LABEL[syncStatus]}</p>
            )}
          </div>
          <Button variant="secondary" className="px-4 py-1.5 text-xs" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <div className="border-t border-parchment-dim/10 pt-4">
          <label htmlFor="display-name" className="block text-xs uppercase tracking-wide text-parchment-dim mb-1.5">
            Display Name
          </label>
          <div className="flex gap-2">
            <input
              id="display-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2 text-parchment focus:border-gold outline-none"
            />
            <Button
              variant="secondary"
              onClick={handleRename}
              disabled={renaming || !nameInput.trim() || nameInput.trim() === currentFullName}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {renaming ? "Saving..." : "Save"}
            </Button>
          </div>
          <p className="text-parchment-dim text-xs mt-2">
            Can be changed once every 15 days.
            {profile && ` Last changed ${new Date(profile.lastNameChangeAt).toLocaleDateString()}.`}
          </p>
          {renameMessage && (
            <p
              role="status"
              className={`text-xs mt-2 ${renameMessage.type === "success" ? "text-gold-bright" : "text-ember"}`}
            >
              {renameMessage.text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
