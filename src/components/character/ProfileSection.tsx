import type { ComponentType, ReactNode } from "react";

interface ProfileSectionProps {
  title: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  className?: string;
  children: ReactNode;
}

/**
 * Reusable card shell for My Profile - every section on the page (and future
 * ones like Relationships, Pets, Quidditch Position) renders through this
 * instead of hand-rolling its own border/label chrome.
 */
export function ProfileSection({ title, icon: Icon, className = "", children }: ProfileSectionProps) {
  return (
    <section className={`border border-parchment-dim/20 rounded-sm px-5 py-4 flex flex-col ${className}`}>
      <p className="flex items-center gap-2 text-parchment-dim text-xs uppercase tracking-[0.2em] mb-3">
        {Icon && <Icon size={14} />}
        {title}
      </p>
      <div className="flex-1">{children}</div>
    </section>
  );
}

/** A single label/value pair, the recurring building block inside a ProfileSection. */
export function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-display text-parchment text-base">{value}</p>
    </div>
  );
}
