import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ProfessorProfile } from "../types/professorPortal";
import { professorPortalRepository } from "../repositories/professorPortalRepository";
import { useAuth } from "./AuthContext";

// Authentication Foundation (Phase 6B). Owns exactly one thing: which
// ProfessorProfile the currently signed-in Supabase user resolves to.
// Supabase Auth -> AuthContext -> professorPortalRepository ->
// (this context) -> Professor pages, per this milestone's own ownership
// chain. Deliberately narrow - teaching courses, roster, office hours, and
// announcements are NOT owned here; see utils/professorScope.ts's hooks,
// which read `professorId` from this context and go through the
// repository themselves, so this context never grows into a second
// ProfessorAssignmentsContext/ProfessorGradesContext-shaped thing.
//
// Identity resolution is a name match against the seeded
// professorProfiles (see data/professorPortal.ts's
// getProfessorProfileByDisplayName), the same honest, no-fabrication rule
// bridges/gradeBridge.ts already established for matching a Character to a
// StudentSubmission: no id is invented, and "no match" is a normal,
// expected outcome (a professor with no seeded persona still gets a
// profile, built from their real Supabase display name, just with empty
// teaching data - never another professor's).
interface AuthenticatedProfessorContextValue {
  professorId: string | null;
  profile: ProfessorProfile | null;
  loading: boolean;
  refresh: () => void;
}

const AuthenticatedProfessorContext = createContext<AuthenticatedProfessorContextValue | undefined>(undefined);

function buildUnmatchedProfile(displayName: string): ProfessorProfile {
  return {
    id: displayName,
    displayName,
    title: "Professor",
    department: "Not yet on file",
    officeLocation: "Not yet on file",
    bio: "No profile information is on file yet.",
    yearsAtHogwarts: 0,
  };
}

export function AuthenticatedProfessorProvider({ children }: { children: ReactNode }) {
  const { profile: authProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfessorProfile | null>(null);
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
    professorPortalRepository.getProfileByDisplayName(authProfile.displayName).then((found) => {
      if (cancelled) return;
      setProfile(found ?? buildUnmatchedProfile(authProfile.displayName));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authProfile, authLoading, refreshToken]);

  return (
    <AuthenticatedProfessorContext.Provider
      value={{
        professorId: profile?.id ?? null,
        profile,
        loading,
        refresh: () => setRefreshToken((token) => token + 1),
      }}
    >
      {children}
    </AuthenticatedProfessorContext.Provider>
  );
}

export function useAuthenticatedProfessor(): AuthenticatedProfessorContextValue {
  const context = useContext(AuthenticatedProfessorContext);
  if (!context) {
    throw new Error("useAuthenticatedProfessor must be used within an AuthenticatedProfessorProvider");
  }
  return context;
}
