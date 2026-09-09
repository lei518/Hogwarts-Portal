import type { ComponentType, ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  action?: ReactNode;
}

/** Shared empty-state card - pairs with LoadingState for the other half of a page's data lifecycle. */
export function EmptyState({ message, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center border border-dashed border-parchment-dim/20 rounded-lg px-5 py-10">
      {Icon && <Icon size={22} className="text-parchment-dim/50" />}
      <p className="text-parchment-dim text-sm max-w-xs">{message}</p>
      {action}
    </div>
  );
}
