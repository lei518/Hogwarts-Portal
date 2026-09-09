import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ProfessorProfile } from "../types/professorPortal";
import { useAuth } from "./AuthContext";

// Phase 7A - Live Academic Data. Identity is now the real signed-in
// Supabase user directly - `professorId` is their real `user.id`, not a
// seeded-persona name match (see the old getProfessorProfileByDisplayName,
// removed). This is what makes course_professor_assignments,
// course_professor lookups, and Assignment authorship all resolve to a
// real account instead of "Professor Severus Snape" or nothing.
interface AuthenticatedProfessorContextValue {
  professorId: string | null;
  profile: ProfessorProfile | null;
  loading: boolean;
  refresh: () => void;
}

const AuthenticatedProfessorContext = createContext<AuthenticatedProfessorContextValue | undefined>(undefined);

export function AuthenticatedProfessorProvider({ children }: { children: ReactNode }) {
  const { user, profile: authProfile, loading: authLoading } = useAuth();

  const profile = useMemo<ProfessorProfile | null>(() => {
    if (!user || !authProfile) return null;
    return {
      id: user.id,
      displayName: authProfile.displayName,
      title: "Professor",
      department: "Not yet on file",
      officeLocation: "Not yet on file",
      bio: "No profile information is on file yet.",
      yearsAtHogwarts: 0,
    };
  }, [user, authProfile]);

  return (
    <AuthenticatedProfessorContext.Provider
      value={{
        professorId: user?.id ?? null,
        profile,
        loading: authLoading,
        refresh: () => {},
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
