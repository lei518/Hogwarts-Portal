import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AdminProfile } from "../types/adminPortal";
import { useAuth } from "./AuthContext";

// Phase 7A - Live Academic Data. Identity is now the real signed-in
// Supabase user directly, same fix as AuthenticatedProfessorContext - no
// more seeded-persona name match (the old getAdminProfileByDisplayName,
// removed), which used to make the Admin Portal header show "Professor
// Minerva McGonagall" regardless of who was actually signed in.
interface AuthenticatedAdminContextValue {
  adminId: string | null;
  profile: AdminProfile | null;
  loading: boolean;
  refresh: () => void;
}

const AuthenticatedAdminContext = createContext<AuthenticatedAdminContextValue | undefined>(undefined);

export function AuthenticatedAdminProvider({ children }: { children: ReactNode }) {
  const { user, profile: authProfile, loading: authLoading } = useAuth();

  const profile = useMemo<AdminProfile | null>(() => {
    if (!user || !authProfile) return null;
    return {
      id: user.id,
      displayName: authProfile.displayName,
      title: "Administrator",
      department: "School Administration",
      bio: "No profile information is on file yet.",
    };
  }, [user, authProfile]);

  return (
    <AuthenticatedAdminContext.Provider
      value={{
        adminId: user?.id ?? null,
        profile,
        loading: authLoading,
        refresh: () => {},
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
