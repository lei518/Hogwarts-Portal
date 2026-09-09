import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";

export function CreateAccount() {
  const navigate = useNavigate();
  const { user, signUp } = useAuth();
  const { syncStatus, pendingGuestAdoption } = useGame();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Same reactive hand-off as Sign In: wait for the fetch (and any
  // guest-save adoption choice) to settle before navigating. A signed-up
  // student's Character is synthesized automatically (see
  // GameContext.tsx) rather than hand-built here, so this always heads to
  // /dashboard once the wait clears - JourneyGate's own
  // `cloudCheckComplete` guard covers the brief remaining gap.
  useEffect(() => {
    if (!user) return;
    if (syncStatus !== "saving" && !pendingGuestAdoption) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, syncStatus, pendingGuestAdoption, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Enter your name.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const result = await signUp(displayName.trim(), email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-display text-parchment mb-1 text-center">Student Registration</h1>
        <p className="text-parchment-dim text-sm text-center mb-6">
          Save your progress and carry it to any device.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Display Name" htmlFor="signup-display-name">
            <Input
              id="signup-display-name"
              required
              autoComplete="name"
              autoFocus
              placeholder="Your full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </FormField>
          <FormField label="Email" htmlFor="signup-email">
            <Input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label="Password" htmlFor="signup-password">
            <Input
              id="signup-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(error)}
            />
          </FormField>
          <FormField label="Confirm Password" htmlFor="signup-confirm-password">
            <Input
              id="signup-confirm-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={Boolean(error)}
            />
          </FormField>

          {error && (
            <p role="alert" className="text-ember text-sm">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Please wait..." : "Create Account"}
          </Button>

          <Link
            to="/sign-in"
            className="text-parchment-dim text-xs hover:text-gold-bright underline underline-offset-2 text-center"
          >
            Already have an account? Sign in
          </Link>
        </form>
      </Card>
    </div>
  );
}
