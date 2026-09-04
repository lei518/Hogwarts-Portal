import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { adminNavigation } from "./navItems";
import { AdminProvider } from "../../context/AdminContext";
import { AuthenticatedAdminProvider } from "../../context/AuthenticatedAdminContext";

// Admin Portal Foundation chrome - matches the ProfessorLayout philosophy
// exactly: standalone, no Character/GameContext dependency of its own, no
// auth guard, no Header. Reuses Sidebar/BottomNav via their `sections`
// prop rather than forking new navigation components. Mounts AdminProvider
// here (not lifted to the app root, unlike the Professor contexts) since
// nothing outside the Admin Portal ever reads administrative state - see
// context/AdminContext.tsx.
//
// Authentication Foundation (Phase 6C): AuthenticatedAdminProvider wraps
// AdminProvider the same way AuthenticatedProfessorProvider wraps
// ProfessorLayout's own children in Phase 6B - identity resolution and
// shared admin operations stay two separate providers, never merged.
export function AdminLayout() {
  return (
    <AuthenticatedAdminProvider>
      <AdminProvider>
        <div className="min-h-screen bg-ink flex">
          <Sidebar sections={adminNavigation} />

          <div className="flex-1 min-w-0 pb-16 md:pb-0 flex flex-col">
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>

          <BottomNav sections={adminNavigation} />
        </div>
      </AdminProvider>
    </AuthenticatedAdminProvider>
  );
}
