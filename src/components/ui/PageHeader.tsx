import type { ComponentType, ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  action?: ReactNode;
}

/** The one consistent page-title pattern: icon-in-chip + title + optional description/action. */
export function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3.5">
        {Icon && (
          <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 text-gold-bright shrink-0">
            <Icon size={19} />
          </span>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-parchment leading-tight">{title}</h1>
          {description && <p className="text-parchment-dim text-sm mt-1">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
