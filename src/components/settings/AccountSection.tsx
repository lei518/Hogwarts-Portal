import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useGame, type SyncStatus } from "../../context/GameContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";

const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  idle: "Not yet synced",
  saving: "Syncing…",
  saved: "Synced",
  offline: "Offline (saved locally)",
};

const STATUS_COLORS: Record<string, string> = {
  Active: "#6b9e6b",
  Disabled: "#c77b7b",
  Locked: "#8a8478",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-parchment-dim/10 last:border-0">
      <span className="text-parchment-dim text-xs uppercase tracking-wide">{label}</span>
      <span className="text-parchment text-sm text-right">{value}</span>
    </div>
  );
}

// University Portal Pivot (Phase 6N) - the Account/Security/Session block
// shared by the Student Settings page and the Professor Portal's own
// Profile page (its closest equivalent - Professor has no separate
// "Settings" route). Read-only account info + a real Supabase Auth
// password change + Sign Out; no display-name editing, no game/story
// preferences - those belonged to the old RPG-flavored Settings page and
// don't fit a university portal. Reads `profile.role` itself to decide
// whether to show Year/House/Cloud Sync (Student-only concepts) rather
// than taking a prop, so both pages can render it identically.
export function AccountSection() {
  const navigate = useNavigate();
  const { user, profile, signOut, changePassword } = useAuth();
  const { syncStatus } = useGame();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!user || !profile) {
    return (
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-[0.2em] text-parchment-dim mb-2">Account</h2>
        <Card className="px-5 py-4">
          <p className="text-parchment-dim text-sm mb-4">
            Sign in to access your account.
          </p>
          <Button variant="secondary" onClick={() => navigate("/authenticate")}>
            Sign In / Create Account
          </Button>
        </Card>
      </section>
    );
  }

  const isStudent = profile.role === "student";
  const statusColor = profile.status ? STATUS_COLORS[profile.status] : undefined;

  // `profile.year`/`profile.house` are null for two legitimate reasons, not
  // a data-loss bug: a self-service /create-account signup (which never
  // collects either, by design - see migrations/0003_add_profile_year_and_
  // house.sql's own comment) and a pre-migration legacy account. Both are
  // meant to default to a Year 1 experience - the exact same `?? 1` this
  // app already applies in GameContext.tsx's character-synthesis effect
  // (`year: profile.year ?? undefined` feeding createInitialCharacter's
  // `input.year ?? STARTING_YEAR`). Mirroring that default here, instead of
  // showing a bare "Not yet assigned", keeps this the one place that
  // convention could otherwise silently diverge.
  const effectiveYear = profile.year ?? 1;
  const houseDisplay =
    effectiveYear === 1
      // A Year 1 student's house always comes from the Sorting Hat, never
      // from this admin-assigned column - profile.house is null here by
      // design (the Edge Function itself rejects setting it for Year 1),
      // not a missing assignment. The Sorting Hat's actual result lives on
      // Character.house (see My Profile), a different record entirely.
      ? "Pending Sorting Ceremony"
      : (profile.house ?? "Not yet assigned");

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "All three fields are required." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation don't match." });
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setChangingPassword(false);

    if (result.error) {
      setPasswordMessage({ type: "error", text: result.error });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage({ type: "success", text: "Password changed." });
  }

  return (
    <>
      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-[0.2em] text-parchment-dim mb-2">Account</h2>
        <Card className="px-5 py-4">
          <Row label="Full Name" value={profile.displayName} />
          <Row label="Email" value={user.email ?? "—"} />
          <Row label="Role" value={profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "—"} />
          {isStudent && <Row label="Year" value={`Year ${effectiveYear}`} />}
          {isStudent && <Row label="House" value={houseDisplay} />}
          <Row
            label="Status"
            value={
              profile.status ? (
                <span
                  className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                  style={{ color: statusColor, borderColor: `${statusColor}66`, background: `${statusColor}15` }}
                >
                  {profile.status}
                </span>
              ) : (
                "—"
              )
            }
          />
          {isStudent && <Row label="Cloud Sync" value={SYNC_STATUS_LABEL[syncStatus]} />}
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-[0.2em] text-parchment-dim mb-2">Security</h2>
        <Card className="px-5 py-4">
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <FormField label="Current Password" htmlFor="current-password">
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                error={passwordMessage?.type === "error"}
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="New Password" htmlFor="new-password">
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  error={passwordMessage?.type === "error"}
                />
              </FormField>
              <FormField label="Confirm New Password" htmlFor="confirm-new-password">
                <Input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  error={passwordMessage?.type === "error"}
                />
              </FormField>
            </div>

            {passwordMessage && (
              <p
                role="status"
                className={`text-xs ${passwordMessage.type === "success" ? "text-gold-bright" : "text-ember"}`}
              >
                {passwordMessage.text}
              </p>
            )}

            <div>
              <Button type="submit" variant="secondary" disabled={changingPassword}>
                {changingPassword ? "Changing…" : "Change Password"}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-[0.2em] text-parchment-dim mb-2">Session</h2>
        <Card className="px-5 py-4 flex items-center justify-between gap-3">
          <div>
            {user.last_sign_in_at && (
              <p className="text-parchment-dim text-xs">
                Last sign in: {new Date(user.last_sign_in_at).toLocaleString()}
              </p>
            )}
          </div>
          <Button variant="secondary" className="px-4 py-1.5 text-xs" onClick={signOut}>
            Sign Out
          </Button>
        </Card>
      </section>
    </>
  );
}
