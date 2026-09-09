import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  supabase,
  supabaseConfigured,
  fetchProfile,
  createProfile,
  type CloudProfile,
  type UserRole,
} from "../services/supabase";

// Authentication Foundation (Phase 6A) - `role`/`active` are derived
// accessors over `profile`, not separate state: Supabase (via `profile`)
// stays the single source of truth, this just saves every consumer from
// reaching into `profile?.role`/`profile?.active` themselves. `loading`
// now also covers the profile fetch (not just session restore) - see this
// file's own effect comments - so a consumer never sees `role` as
// definitively "null" while it's actually still in flight.
interface AuthContextValue {
  user: User | null;
  profile: CloudProfile | null;
  role: UserRole | null;
  active: boolean | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (displayName: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // University Portal Pivot (Phase 6N) - replaces the old display-name
  // rename flow entirely; a student/professor's own account password
  // change, via Supabase Auth directly (see changePassword's own comment
  // on why re-authentication is the verification step).
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
}

const MIN_PASSWORD_LENGTH = 8;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CloudProfile | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  // Gates the profile-fetch effect below until the initial session restore
  // has actually run once - without this, that effect's own "no user yet"
  // branch would fire on the very first render (before getSession() has
  // had a chance to resolve) and flip `loading` false prematurely, letting
  // RoleGate act on an as-yet-unconfirmed "signed out" state. Not exposed
  // on AuthContextValue; it's sequencing plumbing, not authentication state.
  const [sessionResolved, setSessionResolved] = useState(false);
  // Bug fix ("We Can't Find Your Portal" flashing before routing away
  // correctly): tracks which user id `profile` (or an in-flight fetch for
  // it) actually corresponds to. `setUser` and the profile-fetch effect
  // below live in two different effects, so there is otherwise a real gap
  // between "user just changed" and "the effect noticed and set `loading`
  // back to true" - React commits at least one render in between where
  // `user` already reflects the freshly signed-in account but `loading`
  // is still the stale `false` from before, and `role` is still whatever
  // (or nothing) the previous session had. RoleGate reads exactly that
  // render and can flash /access-error before the real fetch has even
  // started - not a missing profile, a timing gap. Fixed by setting
  // `loading` synchronously in the SAME callback that sets `user`
  // whenever the user id actually changes, so React batches both into one
  // render - `loading` is never stale-false for a user whose profile
  // hasn't been resolved yet.
  const resolvedForUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setSessionResolved(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const nextUser = data.session?.user ?? null;
      if (nextUser && nextUser.id !== resolvedForUserId.current) {
        setLoading(true);
      }
      setUser(nextUser);
      setSessionResolved(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      if (nextUser && nextUser.id !== resolvedForUserId.current) {
        setLoading(true);
      }
      setUser(nextUser);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // `loading` now covers the profile fetch too, not just session restore -
  // role-based routing needs both settled before it can safely act, and a
  // profile fetch on today's seed-sized `profiles` table is the only
  // "real" network round trip anywhere in this authentication flow.
  //
  // Bug fix ("We Can't Find Your Portal" for valid accounts): this fetch
  // races an independent write. signUp() below inserts the profiles row
  // AFTER supabase.auth.signUp() resolves - but that same call is what
  // fires the onAuthStateChange listener that sets `user` here, which
  // immediately re-triggers this effect. There is no ordering guarantee
  // between "this SELECT runs" and "signUp()'s INSERT commits", so the
  // very first fetch for a brand-new account can genuinely find no row
  // yet and resolve `null` - which is exactly what sends someone to
  // /access-error despite having a perfectly valid account. A `null`
  // result is retried a few times with a short delay before it's treated
  // as "no profile"; this self-heals the ordinary signup race (the row
  // always appears within milliseconds) while still correctly landing on
  // /access-error for a genuinely orphaned account. This also now catches
  // a thrown error (a transient network failure, say) instead of leaving
  // `loading` stuck true forever with no `.catch()`.
  useEffect(() => {
    if (!sessionResolved) return;
    if (!user) {
      resolvedForUserId.current = null;
      setProfile(null);
      setLoading(false);
      return;
    }
    // Supabase fires onAuthStateChange with a brand-new `user` object on
    // every event (token refresh included), even for the account already
    // signed in - already resolved for this exact id, so there's nothing
    // to redo (and `loading` was never sent back to `true` for it above).
    if (resolvedForUserId.current === user.id) return;

    let cancelled = false;
    setLoading(true);

    async function loadProfile(userId: string) {
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const fetched = await fetchProfile(userId);
        if (cancelled) return;
        if (fetched) {
          resolvedForUserId.current = userId;
          setProfile(fetched);
          setLoading(false);
          return;
        }
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          if (cancelled) return;
        }
      }
      resolvedForUserId.current = userId;
      setProfile(null);
      setLoading(false);
    }

    loadProfile(user.id).catch(() => {
      if (!cancelled) {
        resolvedForUserId.current = user.id;
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, sessionResolved]);

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: /invalid/i.test(error.message) ? "Incorrect email or password." : error.message };
    }
    return { error: null };
  }

  async function signUp(displayName: string, email: string, password: string) {
    if (!supabase) return { error: "Supabase is not configured." };

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { error: /already registered/i.test(error.message) ? "That email is already registered." : error.message };
    }
    // Some Supabase projects respond to a duplicate email with a 200 and an
    // empty `identities` array (anti-enumeration behavior) instead of an
    // error, so a "successful" signup with no identity is also a duplicate.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: "That email is already registered." };
    }
    if (data.user) {
      const created = await createProfile(data.user.id, displayName);
      setProfile(created);
    }
    return { error: null };
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  // University Portal Pivot (Phase 6N) - a signed-in user changing their
  // own password. This never needs service_role or an Edge Function: it's
  // the caller's own account, and supabase.auth.updateUser() operates on
  // whichever session is currently active. Supabase's updateUser() call
  // itself doesn't ask for (or verify) the current password, so that
  // verification step is done explicitly here first, by re-authenticating
  // with it via signInWithPassword - if that fails, the current password
  // was wrong and updateUser() is never called. Neither password is ever
  // persisted anywhere client-side; both only ever pass through to these
  // two Supabase Auth calls.
  async function changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ error: string | null }> {
    if (!supabase) return { error: "Supabase is not configured." };
    if (!user?.email) return { error: "Not signed in." };
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      return { error: "Current password is incorrect." };
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      return { error: updateError.message };
    }
    return { error: null };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role ?? null,
        active: profile?.active ?? null,
        loading,
        configured: supabaseConfigured,
        signIn,
        signUp,
        signOut,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
