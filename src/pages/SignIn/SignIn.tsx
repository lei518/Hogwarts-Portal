import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";
import { ROLE_HOME } from "../../auth/resolveRoleRedirect";

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, loading: authLoading, signIn } = useAuth();
  const { syncStatus, pendingGuestAdoption } = useGame();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Session Management (Phase 6K) - InactivityManager navigates here with
  // this state when it signs someone out after 30 idle minutes; read once
  // on mount so a later re-render (e.g. after typing) doesn't keep
  // re-deriving it from a `location.state` that a normal sign-in redirect
  // never sets.
  const [timeoutMessage] = useState<string | null>(() =>
    (location.state as { reason?: string } | null)?.reason === "inactivity"
      ? "Your session has expired due to inactivity. Please sign in again."
      : null
  );

  // Authentication Foundation (Phase 6A): a Professor, Admin, or (Phase 5)
  // staff role has no Character/cloud-save concept at all, so they skip
  // straight to their own dashboard via the same ROLE_HOME map RoleGate's
  // own resolveRoleRedirect.ts uses. `authLoading` guards against acting
  // on `role` before AuthContext's profile fetch (see its own comment) has
  // actually resolved it.
  //
  // Year-Based Onboarding (Phase 6L): a student's Character is
  // synthesized automatically (see GameContext.tsx), not hand-built on a
  // Character Creation page - so this always navigates to /dashboard once
  // the cloud-save check (and any guest-save-adoption choice) has
  // settled, whether or not a Character exists yet. JourneyGate's own
  // `cloudCheckComplete` guard covers the remaining gap, so GameLayout
  // never has to bounce through Landing in between.
  useEffect(() => {
    if (!user || authLoading || !role) return;
    if (role !== "student") {
      navigate(ROLE_HOME[role], { replace: true });
      return;
    }

    if (syncStatus !== "saving" && !pendingGuestAdoption) {
      navigate(ROLE_HOME.student, { replace: true });
    }
  }, [user, role, authLoading, syncStatus, pendingGuestAdoption, navigate]);

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
      <Card className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-display text-parchment mb-1 text-center">Welcome Back</h1>
        <p className="text-parchment-dim text-sm text-center mb-6">
          Sign in to bring your saved progress with you.
        </p>

        {timeoutMessage && (
          <p role="status" className="text-gold-bright text-sm text-center mb-4">
            {timeoutMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Email" htmlFor="signin-email">
            <Input
              id="signin-email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(error)}
            />
          </FormField>
          <FormField label="Password" htmlFor="signin-password">
            <Input
              id="signin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(error)}
            />
          </FormField>

          {error && (
            <p role="alert" className="text-ember text-sm">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Please wait..." : "Sign In"}
          </Button>

          <Link
            to="/create-account"
            className="text-parchment-dim text-xs hover:text-gold-bright underline underline-offset-2 text-center"
          >
            Need an account? Create one
          </Link>
        </form>
      </Card>
    </div>
  );
}
