import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";
import { isValidUsername } from "../../utils/auth";

const inputClass =
  "w-full bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2.5 text-parchment focus:border-gold outline-none";

export function CreateAccount() {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const { state, syncStatus, pendingGuestAdoption } = useGame();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Same reactive hand-off as Sign In: wait for the fetch (and any guest-save
  // adoption choice) to settle before deciding where to send the player. A
  // brand new account normally has no cloud character yet.
  useEffect(() => {
    if (!user) return;
    if (state.character) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (syncStatus !== "saving" && !pendingGuestAdoption) {
      navigate("/create-character", { replace: true });
    }
  }, [user, state.character, syncStatus, pendingGuestAdoption, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isValidUsername(username)) {
      setError("Usernames must be 3-20 characters: letters, numbers, and underscores only.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const result = await signUp(username, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm border border-gold/30 rounded-sm bg-ink p-8">
        <h1 className="text-2xl font-display text-gold-bright mb-1 text-center">Student Registration</h1>
        <p className="text-parchment-dim text-sm text-center mb-6">
          Save your progress and carry it to any device.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="signup-username" className="block text-xs uppercase tracking-wide text-parchment-dim mb-1.5">
              Username
            </label>
            <input
              id="signup-username"
              required
              autoComplete="username"
              autoFocus
              placeholder="e.g. HarryPotter"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
            <p className="text-parchment-dim/70 text-xs mt-1.5">
              3-20 characters: letters, numbers, and underscores.
            </p>
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-xs uppercase tracking-wide text-parchment-dim mb-1.5">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="signup-confirm-password" className="block text-xs uppercase tracking-wide text-parchment-dim mb-1.5">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-ember text-sm">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full disabled:opacity-40">
            {submitting ? "Please wait..." : "Create Account"}
          </Button>

          <Link
            to="/sign-in"
            className="text-parchment-dim text-xs hover:text-gold-bright underline underline-offset-2 text-center"
          >
            Already have an account? Sign in
          </Link>
        </form>
      </div>
    </div>
  );
}
