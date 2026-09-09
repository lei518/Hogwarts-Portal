import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "gold" | "emerald" | "maroon" | "sapphire";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-parchment-dim/10 text-parchment-dim border-parchment-dim/25",
  gold: "bg-gold/10 text-gold-bright border-gold/30",
  emerald: "bg-pine/20 text-pine border-pine/40",
  maroon: "bg-ember/15 text-ember border-ember/35",
  sapphire: "bg-sapphire/20 text-[#7fa0d6] border-sapphire/40",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

/** Base pill for status/category labels. Specific badges (AcademicStatusBadge, etc.) pick a tone per status. */
export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
