import type { Character } from "../types/character";

// The Player Journey Manager: a pure, router-agnostic model of "what screen
// should this student be on right now?" Kept separate from React so the
// rules are easy to read and test in isolation from routing/rendering
// concerns.
//
// Year-Based Onboarding (Phase 6L): there is no more multi-step Character
// Creation -> Acceptance Letter -> Wand -> Hogwarts Express -> Sorting ->
// Common Room -> Tutorial pipeline. A student's Character is synthesized
// automatically from their Admin-assigned academic year (see
// GameContext.tsx's auto-synthesis effect) the moment they sign in, and
// onboarding is now entirely keyed on that year:
//   - Year 1: the existing Wand Ceremony, then the existing Sorting Hat
//     ceremony (their "first day") - both preserved unchanged.
//   - Year 5: the existing Patronus Charm page, forced once (advanced
//     magic, taught that year) - unchanged implementation, see
//     src/pages/Patronus/Patronus.tsx's own gate.
//   - Every other year: straight to the Portal, no ceremony.
export type JourneyStage = "wand" | "sorting" | "patronus" | "portal";

const PUBLIC_PATHS = new Set(["/", "/authenticate", "/sign-in", "/create-account"]);

const STAGE_PATH: Record<JourneyStage, string | null> = {
  wand: "/wand",
  sorting: "/sorting",
  patronus: "/patronus",
  portal: null,
};

export function getJourneyStage(character: Character): JourneyStage {
  if (character.year === 1) {
    if (!character.wand) return "wand";
    if (!character.sortingCompleted) return "sorting";
  }
  if (character.year === 5 && !character.patronus) return "patronus";
  return "portal";
}

/**
 * Given the current path and the signed-in student's Character, returns the
 * path they should be redirected to, or `null` if they're already where
 * they belong.
 *
 * A Character can only ever exist while signed in, so authentication is
 * checked before anything else: every route except the public (pre-account)
 * ones requires a session. `character === null` while signed in means the
 * auto-synthesis effect in GameContext.tsx hasn't resolved yet - this
 * returns `null` (stay put) rather than redirecting, since JourneyGate
 * itself blanks the render for that brief window instead (see
 * `cloudCheckComplete`).
 */
export function resolveJourneyRedirect(
  pathname: string,
  character: Character | null,
  isAuthenticated: boolean
): string | null {
  if (PUBLIC_PATHS.has(pathname)) return null;
  if (!isAuthenticated) return "/authenticate";
  if (!character) return null;

  const stage = getJourneyStage(character);
  const requiredPath = STAGE_PATH[stage];
  if (requiredPath) return pathname === requiredPath ? null : requiredPath;

  // stage === "portal": /wand and /sorting are Year-1-only, now finished
  // (or never applicable) - never revisit them. /patronus is deliberately
  // NOT blocked here: it keeps its own existing page-level gate (locked
  // below Year 5, shows the saved result once set) and stays reachable any
  // time for Year 5+, exactly as before this change - only the *forced*
  // trip there above (while `stage === "patronus"`) is new.
  if (pathname === "/wand" || pathname === "/sorting") return "/dashboard";
  return null;
}
