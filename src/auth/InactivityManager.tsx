import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Session Management (Phase 6K) - the one centralized inactivity timer for
// every authenticated portal (Student, Professor, Admin). Mounted once at
// the app root (see main.tsx), alongside AuthProvider, rather than inside
// GameLayout/ProfessorLayout/AdminLayout individually - so no portal has
// its own timer, and every portal benefits automatically without knowing
// this exists. Renders nothing; it only watches `user` from AuthContext
// and calls the same signOut() every "Sign Out" button already uses -
// there is no separate logout path.
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// The five interaction categories the spec names - mouse movement, mouse
// clicks, keyboard input, scrolling, and touch (future-proof). `scroll`
// doesn't bubble, so these are all attached with `capture: true` below so
// a scroll inside any nested scrollable container (e.g. Sidebar's own
// overflow-y-auto) still counts as activity, not just window-level scroll.
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

// Any reset within this window is functionally identical for a 30-minute
// timeout - this only exists so a `mousemove` storm doesn't clear/set a
// timeout dozens of times a second, not to change when "inactive" starts.
const RESET_THROTTLE_MS = 1000;

export function InactivityManager() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetRef = useRef(0);

  useEffect(() => {
    if (!user) {
      // Signed out (manually or already timed out) - nothing to watch.
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    function scheduleTimeout() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(handleTimeout, INACTIVITY_TIMEOUT_MS);
    }

    async function handleTimeout() {
      // Navigate first, while the session is still technically valid -
      // /sign-in is exempt from RoleGate's redirect either way, but this
      // ordering avoids a brief, unnecessary bounce through /authenticate
      // that would otherwise happen the instant `user` flips to null.
      navigate("/sign-in", { replace: true, state: { reason: "inactivity" } });
      await signOut();
    }

    function resetTimer() {
      const now = Date.now();
      if (now - lastResetRef.current < RESET_THROTTLE_MS) return;
      lastResetRef.current = now;
      scheduleTimeout();
    }

    scheduleTimeout();
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, resetTimer, { passive: true, capture: true });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, resetTimer, { capture: true });
      }
    };
  }, [user, signOut, navigate]);

  return null;
}
