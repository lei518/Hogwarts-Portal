import { useEffect } from "react";
import { Landmark, X } from "lucide-react";
import { studentNavigation, type NavSection, type PortalRole } from "./navItems";
import { PlayerBadge } from "./PlayerBadge";
import { SidebarContent } from "./SidebarContent";
import type { Character } from "../../types/character";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  character?: Character;
  sections?: NavSection[];
  roleLabel?: string;
  role?: PortalRole;
}

/**
 * The mobile equivalent of Sidebar - same SidebarContent (pinned rails +
 * one-open accordion), same information architecture, just presented as a
 * slide-out drawer over a backdrop instead of a permanent rail. Scrolling
 * the drawer's own content never touches the page behind it, same
 * independent-scroll guarantee as the desktop sidebar.
 */
export function MobileNavDrawer({
  open,
  onClose,
  character,
  sections = studentNavigation,
  roleLabel = "Professor Portal",
  role = "student",
}: MobileNavDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <div className={`md:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-void/80 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] h-full bg-ink border-r border-parchment-dim/10 px-4 py-6 flex flex-col shadow-2xl shadow-black/60 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center w-8 h-8 rounded-md border border-gold/30 bg-gold/10 text-gold-bright shrink-0">
              <Landmark size={16} />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="font-display text-parchment text-lg truncate">Hogwarts</p>
              <p className="text-parchment-dim/60 text-[10px] font-medium uppercase tracking-[0.2em]">Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="flex items-center justify-center w-8 h-8 rounded-md text-parchment-dim hover:text-gold-bright hover:bg-surface transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6 px-2 shrink-0">
          {character ? (
            <PlayerBadge character={character} />
          ) : (
            <p className="text-parchment-dim text-xs font-medium uppercase tracking-[0.15em]">{roleLabel}</p>
          )}
        </div>

        <SidebarContent sections={sections} role={role} onNavigate={onClose} />
      </aside>
    </div>
  );
}
