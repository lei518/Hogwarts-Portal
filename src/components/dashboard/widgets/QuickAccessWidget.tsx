import { Link } from "react-router-dom";
import { studentNavigation, flattenNavigation } from "../../layout/navItems";
import { DashboardWidget } from "../DashboardWidget";

// Sourced from the shared navigation section model - not its own list.
export function QuickAccessWidget() {
  const tiles = flattenNavigation(studentNavigation).filter((item) => item.path !== "/dashboard");

  return (
    <DashboardWidget title="Quick Access">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiles.map(({ path, label, icon: Icon, description }) => (
          <Link
            key={path}
            to={path}
            className="group flex items-center gap-4 border border-parchment-dim/20 rounded-sm px-5 py-4 hover:border-gold transition-colors duration-150"
          >
            <span className="text-gold-bright group-hover:text-gold-bright shrink-0">
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg text-parchment">{label}</p>
              <p className="text-parchment-dim text-xs truncate">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardWidget>
  );
}
