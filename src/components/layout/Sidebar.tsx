import { NavLink } from "react-router-dom";
import { studentNavigation, type NavSection } from "./navItems";
import { PlayerBadge } from "./PlayerBadge";
import type { Character } from "../../types/character";

interface SidebarProps {
  character?: Character;
  /** Defaults to the Student Portal's own nav - other portals (Professor, Admin) pass their own list. */
  sections?: NavSection[];
}

export function Sidebar({ character, sections = studentNavigation }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-void/60 border-r border-parchment-dim/15 px-5 py-6 overflow-y-auto">
      <div className="mb-8 px-1">
        <p className="font-display text-gold-bright text-xl">🏰 Hogwarts</p>
      </div>

      <div className="mb-8 px-1">
        {character ? (
          <PlayerBadge character={character} />
        ) : (
          <p className="text-parchment-dim text-xs uppercase tracking-[0.15em]">Professor Portal</p>
        )}
      </div>

      <nav aria-label="Primary" className="flex flex-col gap-5 flex-1">
        {sections.map((section) => (
          <div key={section.id}>
            {section.items.length > 1 && (
              <p className="px-3 mb-1 text-[11px] uppercase tracking-[0.15em] text-parchment-dim/60">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {section.items.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                      isActive
                        ? "bg-gold/10 text-gold-bright border-l-2 border-gold"
                        : "text-parchment-dim hover:text-parchment border-l-2 border-transparent"
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
