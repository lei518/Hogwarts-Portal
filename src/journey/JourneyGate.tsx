import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { resolveJourneyRedirect } from "./getJourneyStage";

// Wraps the entire route tree so every navigation - typed URL, back button,
// bookmark, or an in-app `navigate()` call - is re-validated against the
// player's actual progress instead of trusting whichever page sent them there.
export function JourneyGate() {
  const location = useLocation();
  const { state } = useGame();
  const { user, loading } = useAuth();

  // The very first render can't yet know whether a session is being
  // restored - deciding "not authenticated" too early would bounce an
  // already-signed-in player (e.g. on refresh) to Sign In before their
  // session has had a chance to load. `body` is already dark (bg-ink), so
  // this brief gap renders as nothing rather than a flash of the wrong page.
  if (loading) return null;

  const redirectTo = resolveJourneyRedirect(
    location.pathname,
    Boolean(state.character?.commonRoomIntroViewed),
    state.character?.tutorialCompleted ?? false,
    Boolean(user)
  );

  if (redirectTo && redirectTo !== location.pathname) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
