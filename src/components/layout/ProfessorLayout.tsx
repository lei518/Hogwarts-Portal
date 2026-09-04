import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { professorNavigation } from "./navItems";
import { AuthenticatedProfessorProvider } from "../../context/AuthenticatedProfessorContext";

// Professor Portal Foundation chrome - parallel to GameLayout, but
// standalone: no Character/GameContext dependency, no auth guard, no Header
// (Owl Post is a Character-scoped concern, see CLAUDE.md's Professor Portal
// section). Reuses Sidebar/BottomNav via their `sections` prop rather than
// forking new navigation components.
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
  return (
    <AuthenticatedProfessorProvider>
      <div className="min-h-screen bg-ink flex">
        <Sidebar sections={professorNavigation} />

        <div className="flex-1 min-w-0 pb-16 md:pb-0 flex flex-col">
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>

        <BottomNav sections={professorNavigation} />
      </div>
    </AuthenticatedProfessorProvider>
  );
}
