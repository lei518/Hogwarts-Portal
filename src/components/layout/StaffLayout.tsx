import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { PortalTopBar } from "./PortalTopBar";
import type { NavSection, PortalRole } from "./navItems";

// Phase 5 - Campus Services. One generic layout for all four operational
// staff roles (Librarian, Healer, Caretaker, Deputy Headmaster) instead of
// four near-duplicate files - AdminLayout/ProfessorLayout only ever
// differed in which nav array/role/roleLabel they passed down, and unlike
// those two, none of these new roles need an AuthenticatedXContext
// identity-resolution layer (that existed only to patch over Phase
// 6-era seeded-persona name-matching, which never applies to a role built
// fresh here - identity is just useAuth()'s real profile directly).
interface StaffLayoutProps {
  sections: NavSection[];
  role: PortalRole;
  roleLabel: string;
  /** Bug fix - Owlery is a real cross-account inbox; every portal needs a
   * working path to it, not just the Student Portal (see App.tsx). */
  owleryPath: string;
}

export function StaffLayout({ sections, role, roleLabel, owleryPath }: StaffLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink flex">
      <Sidebar sections={sections} role={role} roleLabel={roleLabel} />
      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sections={sections}
        role={role}
        roleLabel={roleLabel}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <PortalTopBar onMenuClick={() => setDrawerOpen(true)} owleryPath={owleryPath} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
