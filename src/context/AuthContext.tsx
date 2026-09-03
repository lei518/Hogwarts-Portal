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
} from "../services/supabase";
import { isValidUsername, usernameToEmail } from "../utils/auth";

type RenameResult = { success: true } | { success: false; nextEligibleAt: Date };

interface AuthContextValue {
  user: User | null;
  profile: CloudProfile | null;
  loading: boolean;
  configured: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signUp: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  renameDisplayName: (newName: string) => Promise<RenameResult>;
}

const COOLDOWN_MS = 15 * 24 * 60 * 60 * 1000;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CloudProfile | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    fetchProfile(user.id).then((p) => {
      if (!cancelled) setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function signIn(username: string, password: string) {
    if (!supabase) return { error: "Supabase is not configured." };
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    // Supabase's generic invalid-credentials message still applies (it
    // doesn't know about "usernames"); reword it since the player never
    // typed an email and shouldn't see one implied.
    if (error) {
      return { error: /invalid/i.test(error.message) ? "Incorrect username or password." : error.message };
    }
    return { error: null };
  }

  async function signUp(username: string, password: string) {
    if (!supabase) return { error: "Supabase is not configured." };
    if (!isValidUsername(username)) {
      return { error: "Usernames must be 3-20 characters: letters, numbers, and underscores only." };
    }

    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
    });
    if (error) {
      return { error: /already registered/i.test(error.message) ? "That username is already taken." : error.message };
    }
    // Some Supabase projects respond to a duplicate email with a 200 and an
    // empty `identities` array (anti-enumeration behavior) instead of an
    // error, so a "successful" signup with no identity is also a duplicate.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: "That username is already taken." };
    }
    if (data.user) {
      const created = await createProfile(data.user.id, username);
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
