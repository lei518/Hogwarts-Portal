import { Landmark } from "lucide-react";
import { studentNavigation, type NavSection, type PortalRole } from "./navItems";
import { PlayerBadge } from "./PlayerBadge";
import { SidebarContent } from "./SidebarContent";
import type { Character } from "../../types/character";

interface SidebarProps {
  character?: Character;
  /** Defaults to the Student Portal's own nav - other portals (Professor, Admin) pass their own list. */
  sections?: NavSection[];
  /** Shown under the logo when no character is signed in (Professor/Admin portals). */
  roleLabel?: string;
  /** Which portal this is - keys the "which section was left open" memory per role. */
  role?: PortalRole;
}

/**
 * Desktop navigation rail. Always exactly viewport-tall and pinned via
 * `sticky top-0` so scrolling the page content never carries the sidebar
 * away with it - only the middle (collapsible sections) region scrolls on
 * its own, via SidebarContent's own `overflow-y-auto`, if it ever needs to.
 */
export function Sidebar({ character, sections = studentNavigation, roleLabel = "Professor Portal", role = "student" }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-void/70 border-r border-parchment-dim/10 px-4 py-6">
      <div className="flex items-center gap-2.5 mb-8 px-2 shrink-0">
        <span className="flex items-center justify-center w-8 h-8 rounded-md border border-gold/30 bg-gold/10 text-gold-bright shrink-0">
          <Landmark size={16} />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="font-display text-parchment text-lg truncate">Hogwarts</p>
          <p className="text-parchment-dim/60 text-[10px] font-medium uppercase tracking-[0.2em]">Portal</p>
        </div>
      </div>

      <div className="mb-6 px-2 shrink-0">
        {character ? (
          <PlayerBadge character={character} />
        ) : (
          <p className="text-parchment-dim text-xs font-medium uppercase tracking-[0.15em]">{roleLabel}</p>
        )}
      </div>

      <SidebarContent sections={sections} role={role} />
    </aside>
  );
}
