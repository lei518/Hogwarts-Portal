import { Link } from "react-router-dom";
import type { ComponentType, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "../ui/Card";

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
    <Card as="section" className={`px-5 py-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="flex items-center gap-2 text-parchment-dim text-xs font-medium uppercase tracking-[0.15em]">
          {Icon && <Icon size={14} className="text-gold/80" />}
          {title}
        </p>
        {to && (
          <Link
            to={to}
            className="flex items-center gap-0.5 text-[11px] font-medium text-gold hover:text-gold-bright transition-colors shrink-0"
          >
            {actionLabel}
            <ChevronRight size={12} />
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}
