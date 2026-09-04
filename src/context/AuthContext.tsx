import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  supabase,
  supabaseConfigured,
  fetchProfile,
  createProfile,
  updateProfileName,
  type CloudProfile,
  type UserRole,
} from "../services/supabase";

type RenameResult = { success: true } | { success: false; nextEligibleAt: Date };

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
  renameDisplayName: (newName: string) => Promise<RenameResult>;
}

const COOLDOWN_MS = 15 * 24 * 60 * 60 * 1000;

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

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setSessionResolved(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setSessionResolved(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // `loading` now covers the profile fetch too, not just session restore -
  // role-based routing needs both settled before it can safely act, and a
  // profile fetch on today's seed-sized `profiles` table is the only
  // "real" network round trip anywhere in this authentication flow.
  useEffect(() => {
    if (!sessionResolved) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProfile(user.id).then((p) => {
      if (!cancelled) {
        setProfile(p);
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

  async function renameDisplayName(newName: string): Promise<RenameResult> {
    if (!user) throw new Error("Not signed in.");
    try {
      const updated = await updateProfileName(user.id, newName);
      setProfile(updated);
      return { success: true };
    } catch {
      // The trigger rolled back the update; re-fetch the still-current row so the
      // eligible-again date comes from Supabase, not client-side guesswork.
      const current = await fetchProfile(user.id);
      if (current) setProfile(current);
      const lastChange = current ? new Date(current.lastNameChangeAt) : new Date();
      return { success: false, nextEligibleAt: new Date(lastChange.getTime() + COOLDOWN_MS) };
    }
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
        renameDisplayName,
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
