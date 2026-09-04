import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";

const inputClass =
  "w-full bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2.5 text-parchment focus:border-gold outline-none";

export function SignIn() {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, signIn } = useAuth();
  const { state, syncStatus, pendingGuestAdoption } = useGame();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Authentication Foundation (Phase 6A): a Professor or Admin has no
  // Character/cloud-save concept at all, so they skip straight to their
  // own dashboard - only a student falls through to the existing
  // character-bearing-vs-brand-new logic below, unchanged. `authLoading`
  // guards against acting on `role` before AuthContext's profile fetch
  // (see its own comment) has actually resolved it.
  useEffect(() => {
    if (!user || authLoading) return;
    if (role === "professor") {
      navigate("/professor/dashboard", { replace: true });
      return;
    }
    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    if (role !== "student") return;

    // Once signed in, wait for the cloud save fetch to settle (and any
    // guest-save-adoption choice to resolve) before deciding where a
    // character-bearing player goes vs. a brand new one.
    if (state.character) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (syncStatus !== "saving" && !pendingGuestAdoption) {
      navigate("/create-character", { replace: true });
    }
  }, [user, role, authLoading, state.character, syncStatus, pendingGuestAdoption, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email, password);
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
            <label htmlFor="signin-email" className="block text-xs uppercase tracking-wide text-parchment-dim mb-1.5">
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
