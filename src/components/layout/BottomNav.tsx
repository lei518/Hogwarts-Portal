import { Link, useLocation } from "react-router-dom";
import { studentNavigation } from "./navItems";

// One tab per section, not a slice of a flat list - every section stays
// reachable from mobile. Each tab opens its section's first page; a tab is
// "active" whenever the current route belongs to that section at all, since
// a section can hold pages the tab itself doesn't link to directly.
export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-void/95 border-t border-parchment-dim/15 backdrop-blur-sm"
    >
      <ul className="flex justify-around">
        {studentNavigation.map((section) => {
          const primaryItem = section.items[0];
          if (!primaryItem) return null;
          const isActive = section.items.some((item) => item.path === pathname);
          const Icon = section.icon;
          return (
            <li key={section.id} className="flex-1">
              <Link
                to={primaryItem.path}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                  isActive ? "text-gold-bright" : "text-parchment-dim"
                }`}
              >
                <Icon size={20} />
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
