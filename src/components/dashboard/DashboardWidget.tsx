import { Link } from "react-router-dom";
import type { ComponentType, ReactNode } from "react";

interface DashboardWidgetProps {
  title: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  /** Canonical page this widget summarizes; renders a "view all" link when set. */
  to?: string;
  actionLabel?: string;
  className?: string;
  children: ReactNode;
}

/** Shared card shell every Home widget renders through - see CLAUDE.md's Home section. */
export function DashboardWidget({
  title,
  icon: Icon,
  to,
  actionLabel = "View",
  className = "",
  children,
}: DashboardWidgetProps) {
  return (
    <section
      className={`border border-parchment-dim/20 rounded-sm px-5 py-4 flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="flex items-center gap-2 text-parchment-dim text-xs uppercase tracking-[0.2em]">
          {Icon && <Icon size={14} />}
          {title}
        </p>
        {to && (
          <Link
            to={to}
            className="text-[11px] text-gold hover:text-gold-bright transition-colors shrink-0"
          >
            {actionLabel} →
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}
