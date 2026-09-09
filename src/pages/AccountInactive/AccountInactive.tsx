import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Card } from "../../components/ui/Card";

// Authentication Foundation (Phase 6A). Reached only via RoleGate, after it
// has already signed the user out - visual language matches
// components/layout/ErrorBoundary.tsx's fallback screen (bordered card,
// centered, one action row) for consistency, without reusing that
// component itself: this is an expected, well-typed account state, not an
// unhandled render crash.
export function AccountInactivePage() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <Card className="max-w-md w-full px-8 py-10 text-center">
        <Lock size={32} className="text-parchment-dim/60 mx-auto mb-4" />
        <h1 className="text-2xl font-display text-gold-bright mb-3">Account Inactive</h1>
        <p className="text-parchment-dim text-sm mb-8">
          This account has been deactivated and you've been signed out. If you believe this is a mistake,
          please contact the school for assistance.
        </p>
        <Link
          to="/authenticate"
          className="inline-flex items-center justify-center px-8 py-3 font-body font-medium text-sm tracking-wide rounded-md border bg-gold text-ink border-gold shadow-sm shadow-black/20 hover:bg-gold-bright hover:border-gold-bright hover:-translate-y-px transition-all duration-200"
        >
          Return to Sign In
        </Link>
      </Card>
    </div>
  );
}
