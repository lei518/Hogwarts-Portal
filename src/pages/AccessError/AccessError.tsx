import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
      <div className="max-w-md w-full border border-parchment-dim/20 rounded-sm px-8 py-10 text-center">
        <p className="text-4xl mb-4">🧭</p>
        <h1 className="text-2xl font-display text-gold-bright mb-3">We Can't Find Your Portal</h1>
        <p className="text-parchment-dim text-sm mb-8">
          Your account doesn't have a role we recognize yet, so we can't tell which portal you belong in.
          Please contact the school for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => signOut()}
            className="px-8 py-3 font-body text-sm tracking-wide rounded-sm border bg-gold text-ink border-gold hover:bg-gold-bright hover:border-gold-bright transition-colors duration-200"
          >
            Sign Out
          </button>
          <Link
            to="/"
            className="px-8 py-3 font-body text-sm tracking-wide rounded-sm border bg-transparent text-parchment border-parchment-dim/50 hover:border-gold hover:text-gold transition-colors duration-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
