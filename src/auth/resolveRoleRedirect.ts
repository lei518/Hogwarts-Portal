import type { UserRole } from "../services/supabase";

// Authentication Foundation (Phase 6A): a pure, router-agnostic model of
// "which portal does this path belong to, and is the signed-in user
// allowed there" - mirrors journey/getJourneyStage.ts's own split of pure
// redirect logic from the component that applies it (src/auth/RoleGate.tsx).

// Reachable regardless of auth/role state - the pre-auth pages, plus the
// two dedicated error screens RoleGate itself redirects to (so neither of
// those redirects loops back on itself).
const EXEMPT_PATHS = new Set([
  "/",
  "/authenticate",
  "/sign-in",
  "/create-account",
  "/account-inactive",
  "/access-error",
]);

// Phase 5 - Campus Services: four operational staff roles, each with their
// own portal at its own path prefix. Exported so SignIn.tsx's post-sign-in
// redirect can reuse this same map instead of duplicating it.
export const ROLE_HOME: Record<UserRole, string> = {
  student: "/dashboard",
  professor: "/professor/dashboard",
  admin: "/admin/dashboard",
  librarian: "/librarian/dashboard",
  healer: "/healer/dashboard",
  caretaker: "/caretaker/dashboard",
  deputy_headmaster: "/deputy-headmaster/dashboard",
};

const PORTAL_PATH_PREFIXES: Record<string, UserRole> = {
  "/professor": "professor",
  "/admin": "admin",
  "/librarian": "librarian",
  "/healer": "healer",
  "/caretaker": "caretaker",
  "/deputy-headmaster": "deputy_headmaster",
};

// Everything under a known staff prefix belongs to that portal; everything
// else (onboarding, /dashboard, /courses, ...) is Student territory - the
// same "anything not explicitly claimed is protected by default" posture
// getJourneyStage.ts already uses for its own "Portal territory" bucket.
function portalForPath(pathname: string): UserRole | null {
  for (const [prefix, role] of Object.entries(PORTAL_PATH_PREFIXES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}

/**
 * Given the current path and the signed-in user's resolved role, returns
 * the path they should be redirected to, or `null` if they're already
 * somewhere they're allowed to be.
 *
 * Deliberately does NOT decide inactive-account or missing-role handling -
 * RoleGate checks those first (they need a signOut() side effect this pure
 * function can't perform) and only calls this once neither applies.
 */
export function resolveRoleRedirect(
  pathname: string,
  isAuthenticated: boolean,
  role: UserRole | null
): string | null {
  if (EXEMPT_PATHS.has(pathname)) return null;
  if (!isAuthenticated) return "/authenticate";
  if (!role) return null; // RoleGate redirects to /access-error before this is reached

  const targetPortal = portalForPath(pathname);
  if (targetPortal) {
    return targetPortal === role ? null : ROLE_HOME[role];
  }
  // Not a /professor or /admin path, so it's Student territory (onboarding
  // included) - only a student may be here.
  return role === "student" ? null : ROLE_HOME[role];
}
