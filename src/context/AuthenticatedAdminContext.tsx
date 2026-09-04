import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AdminProfile } from "../types/adminPortal";
import { adminRepository } from "../repositories/adminRepository";
import { useAuth } from "./AuthContext";

// Authentication Foundation (Phase 6C). Owns exactly one thing: which
// AdminProfile the currently signed-in Supabase user resolves to. Mirrors
// AuthenticatedProfessorContext (Phase 6B) exactly: Supabase Auth ->
// AuthContext -> adminRepository -> (this context) -> useAdminScope() ->
// Admin pages. Deliberately narrow - accounts, service requests, calendar
// drafts, house point adjustments, and resource requests are NOT owned
// here and are NOT filtered by administrator (this milestone does not
// implement multi-admin data ownership - see CLAUDE.md's Admin Portal
// section); those stay exactly as AdminContext already owns them. This
// context determines who the administrator is, nothing more.
//
// Identity resolution is a name match against the seeded adminProfiles
// (see data/adminPortal.ts's getAdminProfileByDisplayName), the same
// honest, no-fabrication correspondence rule Phase 6B established for
// professors: no id is invented, and "no match" is a normal, expected
// outcome (an administrator with no seeded persona still gets a profile,
// built from their real Supabase display name, just with placeholder
// fields - never another administrator's).
interface AuthenticatedAdminContextValue {
  adminId: string | null;
  profile: AdminProfile | null;
  loading: boolean;
  refresh: () => void;
}

const AuthenticatedAdminContext = createContext<AuthenticatedAdminContextValue | undefined>(undefined);

function buildUnmatchedProfile(displayName: string): AdminProfile {
  return {
    id: displayName,
    displayName,
    title: "Administrator",
    department: "Not yet on file",
    bio: "No profile information is on file yet.",
  };
}

export function AuthenticatedAdminProvider({ children }: { children: ReactNode }) {
  const { profile: authProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!authProfile) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    adminRepository.getProfileByDisplayName(authProfile.displayName).then((found) => {
      if (cancelled) return;
      setProfile(found ?? buildUnmatchedProfile(authProfile.displayName));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authProfile, authLoading, refreshToken]);

  return (
    <AuthenticatedAdminContext.Provider
      value={{
        adminId: profile?.id ?? null,
        profile,
        loading,
        refresh: () => setRefreshToken((token) => token + 1),
      }}
    >
      {children}
    </AuthenticatedAdminContext.Provider>
  );
}

export function useAuthenticatedAdmin(): AuthenticatedAdminContextValue {
  const context = useContext(AuthenticatedAdminContext);
  if (!context) {
    throw new Error("useAuthenticatedAdmin must be used within an AuthenticatedAdminProvider");
  }
  return context;
}
