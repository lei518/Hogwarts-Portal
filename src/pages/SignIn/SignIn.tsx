import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";

const inputClass =
  "w-full bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2.5 text-parchment focus:border-gold outline-none";

export function SignIn() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { state, syncStatus, pendingGuestAdoption } = useGame();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Once signed in, wait for the cloud save fetch to settle (and any
  // guest-save-adoption choice to resolve) before deciding where a
  // character-bearing player goes vs. a brand new one.
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
    setSubmitting(true);
    const result = await signIn(username, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm border border-gold/30 rounded-sm bg-ink p-8">
        <h1 className="text-2xl font-display text-gold-bright mb-1 text-center">Welcome Back</h1>
        <p className="text-parchment-dim text-sm text-center mb-6">
          Sign in to bring your saved progress with you.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="signin-username" className="block text-xs uppercase tracking-wide text-parchment-dim mb-1.5">
              Username
            </label>
            <input
              id="signin-username"
              required
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="signin-password" className="block text-xs uppercase tracking-wide text-parchment-dim mb-1.5">
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-ember text-sm">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full disabled:opacity-40">
            {submitting ? "Please wait..." : "Sign In"}
          </Button>

          <Link
            to="/create-account"
            className="text-parchment-dim text-xs hover:text-gold-bright underline underline-offset-2 text-center"
          >
            Need an account? Create one
          </Link>
        </form>
      </div>
    </div>
  );
}
