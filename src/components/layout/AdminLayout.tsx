import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { PortalTopBar } from "./PortalTopBar";
import { adminNavigation } from "./navItems";
import { AdminProvider } from "../../context/AdminContext";
import { AuthenticatedAdminProvider } from "../../context/AuthenticatedAdminContext";

// Admin Portal Foundation chrome - matches the ProfessorLayout philosophy
// exactly: standalone, no Character/GameContext dependency of its own, no
// auth guard, no Header. Reuses Sidebar/MobileNavDrawer via their
// `sections` prop rather than forking new navigation components;
// PortalTopBar carries the mobile drawer trigger in Header's place, plus
// the same Owlery notification icon Header shows - Owlery is a real
// cross-account inbox (see context/OwleryContext.tsx), so Admin needs a
// working path to it too. Mounts AdminProvider here (not lifted to
// the app root, unlike the Professor contexts) since nothing outside the
// Admin Portal ever reads administrative state - see
// context/AdminContext.tsx.
//
// Authentication Foundation (Phase 6C): AuthenticatedAdminProvider wraps
// AdminProvider the same way AuthenticatedProfessorProvider wraps
// ProfessorLayout's own children in Phase 6B - identity resolution and
// shared admin operations stay two separate providers, never merged.
export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AuthenticatedAdminProvider>
      <AdminProvider>
        <div className="min-h-screen bg-ink flex">
          <Sidebar sections={adminNavigation} role="admin" roleLabel="Admin Portal" />
          <MobileNavDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sections={adminNavigation}
            role="admin"
            roleLabel="Admin Portal"
          />

          <div className="flex-1 min-w-0 flex flex-col">
            <PortalTopBar onMenuClick={() => setDrawerOpen(true)} owleryPath="/admin/owlery" />
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </AdminProvider>
    </AuthenticatedAdminProvider>
  );
}
