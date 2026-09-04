import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resolveRoleRedirect } from "./resolveRoleRedirect";

// Authentication Foundation (Phase 6A). Wraps the entire route tree, above
// JourneyGate and above every portal layout, so every navigation is
// re-validated against the signed-in user's role - the same
// "re-validate on every navigation, don't trust whichever page sent them
// there" posture JourneyGate already established for onboarding progress.
//
// This is intentionally the ONE place role/active gets enforced: Student,
// Professor, and Admin routes, layouts, and business logic are otherwise
// completely unaware this exists, per this milestone's own backward-
// compatibility rule.
export function RoleGate() {
  const location = useLocation();
  const { user, role, active, loading, signOut } = useAuth();

  // Side effect (signing out) can't happen during render - once we know an
  // authenticated user's account is inactive, sign them out here; the
  // render below immediately reflects the "inactive" outcome without
  // waiting for that async call to finish, so there's no flash of
  // protected content in between.
  useEffect(() => {
    if (!loading && user && active === false) {
      signOut();
    }
  }, [loading, user, active, signOut]);

  // Mirrors JourneyGate's own "loading -> render nothing" rule: deciding
  // "signed out" or "no role" too early would bounce an already-signed-in
  // user (e.g. on refresh) before their session/profile has finished
  // loading. `loading` now covers both (see AuthContext's own comment).
  if (loading) return null;

  if (user && active === false) {
    return location.pathname === "/account-inactive" ? <Outlet /> : <Navigate to="/account-inactive" replace />;
  }

  if (user && !role) {
    return location.pathname === "/access-error" ? <Outlet /> : <Navigate to="/access-error" replace />;
  }

  const redirectTo = resolveRoleRedirect(location.pathname, Boolean(user), role);
  if (redirectTo && redirectTo !== location.pathname) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
