import type { ComponentType, ReactNode } from "react";
import { Card } from "../ui/Card";

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
    <Card as="section" className={`px-5 py-4 flex flex-col ${className}`}>
      <p className="flex items-center gap-2 text-parchment-dim text-xs font-medium uppercase tracking-[0.15em] mb-3">
        {Icon && <Icon size={14} className="text-gold/80" />}
        {title}
      </p>
      <div className="flex-1">{children}</div>
    </Card>
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
