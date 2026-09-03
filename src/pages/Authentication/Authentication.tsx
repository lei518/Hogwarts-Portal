import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";

// The dedicated Authentication screen "Begin Journey" leads to. Its only
// job is offering the two entry points into the (separate) Sign In /
// Create Account pages - it holds no auth logic of its own.
export function Authentication() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm border border-gold/30 rounded-sm bg-ink p-8 text-center">
        <h1 className="text-2xl font-display text-gold-bright mb-1">Enter Hogwarts</h1>
        <p className="text-parchment-dim text-sm mb-8">
          Sign in to continue your story, or create an account to begin one.
        </p>

        <div className="flex flex-col gap-4">
          <Button variant="primary" className="w-full" onClick={() => navigate("/sign-in")}>
            Sign In
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate("/create-account")}>
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}
