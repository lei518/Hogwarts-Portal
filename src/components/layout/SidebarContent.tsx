import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { splitNavigation, type NavSection, type PortalRole } from "./navItems";

function isItemActive(pathname: string, itemPath: string): boolean {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function storageKey(role: PortalRole): string {
  return `hogwarts:nav:expanded:${role}`;
}

interface SidebarContentProps {
  sections: NavSection[];
  role: PortalRole;
  /** Called after a link is clicked - the mobile drawer uses this to close itself. */
  onNavigate?: () => void;
}

/**
 * The actual nav content - pinned top rail, one-open-at-a-time collapsible
 * sections, pinned bottom rail. Rendered by both the desktop Sidebar (inside
 * a sticky h-screen aside) and the mobile drawer (inside a slide-out panel),
 * so the information architecture and behavior never drift between them.
 */
export function SidebarContent({ sections, role, onNavigate }: SidebarContentProps) {
  const { pathname } = useLocation();
  const { top, bottom, collapsible } = splitNavigation(sections);

  const activeSection = collapsible.find((section) =>
    section.items.some((item) => isItemActive(pathname, item.path))
  );

  const [expandedId, setExpandedId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(storageKey(role));
    } catch {
      return null;
    }
  });

  // A page inside a different section than the one currently open takes
  // priority - keeps the sidebar oriented to where the student actually is.
  // A page that isn't in any collapsible section (a pinned top/bottom page)
  // leaves whatever was previously open exactly as it was.
  useEffect(() => {
    if (activeSection && activeSection.id !== expandedId) {
      setExpandedId(activeSection.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    try {
      if (expandedId) localStorage.setItem(storageKey(role), expandedId);
      else localStorage.removeItem(storageKey(role));
    } catch {
      // Private browsing / storage disabled - state still works for this session.
    }
  }, [expandedId, role]);

  function toggleSection(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      isActive ? "bg-gold/10 text-gold-bright" : "text-parchment-dim hover:bg-surface hover:text-parchment"
    }`;

  return (
    <nav aria-label="Primary" className="flex flex-col h-full min-h-0">
      {top.length > 0 && (
        <div className="flex flex-col gap-0.5 shrink-0">
          {top.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} className={linkClass} onClick={onNavigate}>
              <Icon size={17} className="shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      )}

      {top.length > 0 && collapsible.length > 0 && (
        <div className="h-px bg-parchment-dim/10 my-4 shrink-0" />
      )}

      <div className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
        {collapsible.map((section) => {
          const expanded = expandedId === section.id;
          const SectionIcon = section.icon;
          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={expanded}
                aria-controls={`nav-section-${section.id}`}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-150 ${
                  expanded ? "text-gold-bright" : "text-parchment-dim/70 hover:text-parchment"
                }`}
              >
                <SectionIcon size={15} className="shrink-0" />
                <span className="flex-1 text-left truncate">{section.label}</span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                />
              </button>

              {expanded && (
                <div id={`nav-section-${section.id}`} className="flex flex-col gap-0.5 pl-2 pb-1 animate-fade-in">
                  {section.items.map(({ path, label, icon: Icon }) => (
                    <NavLink key={path} to={path} className={linkClass} onClick={onNavigate}>
                      <Icon size={16} className="shrink-0" />
                      <span className="truncate">{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {bottom.length > 0 && (
        <div className="flex flex-col gap-0.5 shrink-0 pt-4 mt-2 border-t border-parchment-dim/10">
          {bottom.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} className={linkClass} onClick={onNavigate}>
              <Icon size={17} className="shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
