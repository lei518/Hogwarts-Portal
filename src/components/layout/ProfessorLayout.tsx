import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { PortalTopBar } from "./PortalTopBar";
import { professorNavigation } from "./navItems";
import { AuthenticatedProfessorProvider } from "../../context/AuthenticatedProfessorContext";

// Professor Portal Foundation chrome - parallel to GameLayout, but
// standalone: no Character/GameContext dependency, no auth guard, no Header
// (Header itself depends on GameContext). Reuses Sidebar/MobileNavDrawer via
// their `sections` prop rather than forking new navigation components;
// PortalTopBar carries the mobile drawer trigger in Header's place, plus
// the same Owlery notification icon Header shows - Owlery is a real
// cross-account inbox (see context/OwleryContext.tsx), not a
// Character-scoped concern, so every role needs a working path to it.
//
// Neither ProfessorAssignmentsProvider nor ProfessorGradesProvider is
// mounted here as of Phase 3D - both now live at the app root (see
// main.tsx) so the Student Portal's bridges (src/bridges/) and this portal
// read the exact same state, instead of two independent copies that could
// drift apart. AuthenticatedProfessorProvider (Phase 6B), by contrast, is
// scoped here and only here - it depends on AuthContext (already at the
// root) and nothing outside the Professor Portal ever needs to know which
// professor is signed in.
export function ProfessorLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AuthenticatedProfessorProvider>
      <div className="min-h-screen bg-ink flex">
        <Sidebar sections={professorNavigation} role="professor" roleLabel="Professor Portal" />
        <MobileNavDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sections={professorNavigation}
          role="professor"
          roleLabel="Professor Portal"
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <PortalTopBar onMenuClick={() => setDrawerOpen(true)} owleryPath="/professor/owlery" />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthenticatedProfessorProvider>
  );
}
