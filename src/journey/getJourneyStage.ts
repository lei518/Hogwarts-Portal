// The Player Journey Manager: a pure, router-agnostic model of "what screen
// should this player be on right now?" Kept separate from React so the rules
// are easy to read and test in isolation from routing/rendering concerns.

export type JourneyStage = "onboarding" | "tutorial" | "dashboard";

// Routes that make up the enrollment -> Common Room onboarding pipeline.
// `/character` is intentionally excluded: it's also a permanent nav link
// (see navItems.ts) and already handles the "no player yet" case itself.
// `/patronus` is deliberately NOT here - it's a Year 5+ Portal feature, not
// onboarding, so it falls through to the ordinary "protected territory"
// bucket below and is only reachable once onboarding is fully complete.
const ONBOARDING_PATHS = new Set([
  "/create-character",
  "/acceptance-letter",
  "/wand",
  "/hogwarts-express",
  "/sorting",
  "/common-room",
]);

// Reachable with no session at all - the only paths a signed-out visitor
// can ever land on.
const PUBLIC_PATHS = new Set(["/", "/authenticate", "/sign-in", "/create-account"]);

// Needs a session, but - unlike everything else - not gated on onboarding
// progress: `/character` is shown mid-pipeline (right after the Common Room
// introduction, before Tutorial) as well as afterward as a permanent nav link.
const AUTH_ONLY_PATHS = new Set(["/character"]);

// `pipelineComplete` means the character exists AND has been all the way
// through onboarding (sorted, wanded, welcomed into their house's Common
// Room) - not just that a character record exists. The character is
// created in state right after the identity step, before the rest of the
// pipeline runs, so "a character exists" alone doesn't mean onboarding is
// done.
export function getJourneyStage(pipelineComplete: boolean, tutorialCompleted: boolean): JourneyStage {
  if (!pipelineComplete) return "onboarding";
  if (!tutorialCompleted) return "tutorial";
  return "dashboard";
}

/**
 * Given the current path and the player's progress, returns the path they
 * should be redirected to, or `null` if they're already where they belong.
 *
 * A character can only ever be created while signed in, so authentication
 * is checked before anything else: every route except the public
 * (pre-account) ones requires a session, full stop - no carve-out for a
 * pre-existing local character. Anything not explicitly known as an
 * onboarding path, `/tutorial`, or `/character` is treated as protected
 * "Portal" territory (e.g. everything under `GameLayout`, including
 * `/patronus`) - new pages added there are protected by default.
 */
export function resolveJourneyRedirect(
  pathname: string,
  pipelineComplete: boolean,
  tutorialCompleted: boolean,
  isAuthenticated: boolean
): string | null {
  if (PUBLIC_PATHS.has(pathname)) return null;
  if (!isAuthenticated) return "/authenticate";
  if (AUTH_ONLY_PATHS.has(pathname)) return null;

  const stage = getJourneyStage(pipelineComplete, tutorialCompleted);

  if (ONBOARDING_PATHS.has(pathname)) {
    if (stage === "onboarding") return null;
    // Route through `/tutorial` rather than `/dashboard`: Common Room
    // finalizes onboarding (sets `commonRoomIntroViewed`) and calls
    // navigate("/tutorial") in the same tick, so redirecting here to the
    // same destination avoids a race where this gate's own redirect
    // (reacting to the just-updated character before the router has
    // applied that pending navigation) would otherwise win and skip ahead.
    return stage === "tutorial" ? "/tutorial" : "/dashboard";
  }

  if (pathname === "/tutorial") {
    if (stage === "tutorial") return null;
    return stage === "onboarding" ? "/create-character" : "/dashboard";
  }

  // Protected Portal territory (Dashboard, Spells, Patronus, etc.).
  if (stage === "dashboard") return null;
  return stage === "onboarding" ? "/create-character" : "/tutorial";
}
