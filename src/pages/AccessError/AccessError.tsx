import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

// Authentication Foundation (Phase 6A). Reached when a signed-in user has
// no resolvable role - a missing profile row, or one whose `role` column
// holds something other than the three known values. Visual language
// matches components/layout/ErrorBoundary.tsx's fallback screen, without
// reusing that component: this is an expected, well-typed account state,
// not an unhandled render crash.
export function AccessErrorPage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <Card className="max-w-md w-full px-8 py-10 text-center">
        <Compass size={32} className="text-parchment-dim/60 mx-auto mb-4" />
        <h1 className="text-2xl font-display text-gold-bright mb-3">We Can't Find Your Portal</h1>
        <p className="text-parchment-dim text-sm mb-8">
          Your account doesn't have a role we recognize yet, so we can't tell which portal you belong in.
          Please contact the school for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => signOut()}>Sign Out</Button>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 font-body font-medium text-sm tracking-wide rounded-md border bg-transparent text-parchment border-parchment-dim/40 hover:border-gold hover:text-gold-bright hover:-translate-y-px transition-all duration-200"
          >
            Return Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
