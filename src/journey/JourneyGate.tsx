import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { resolveJourneyRedirect } from "./getJourneyStage";

// Wraps the entire route tree so every navigation - typed URL, back button,
// bookmark, or an in-app `navigate()` call - is re-validated against the
// student's actual progress instead of trusting whichever page sent them
// there.
export function JourneyGate() {
  const location = useLocation();
  const { state, cloudCheckComplete } = useGame();
  const { user, role, loading: authLoading } = useAuth();

  // The very first render can't yet know whether a session is being
  // restored - deciding "not authenticated" too early would bounce an
  // already-signed-in player (e.g. on refresh) to Sign In before their
  // session has had a chance to load. `body` is already dark (bg-ink), so
  // this brief gap renders as nothing rather than a flash of the wrong page.
  if (authLoading) return null;

  // Year-Based Onboarding (Phase 6L): a signed-in student's Character is
  // synthesized automatically (see GameContext.tsx) rather than hand-built
  // on a Character Creation page - but that synthesis can't happen until
  // the cloud-save check has settled. Blank here too, rather than letting
  // GameLayout's own `!character` guard bounce to Landing ("/") only to
  // bounce right back once synthesis completes a moment later.
  if (user && role === "student" && !state.character && !cloudCheckComplete) return null;

  const redirectTo = resolveJourneyRedirect(location.pathname, state.character, Boolean(user));

  if (redirectTo && redirectTo !== location.pathname) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
