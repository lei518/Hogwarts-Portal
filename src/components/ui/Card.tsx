import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Adds a subtle lift + border glow on hover, for cards that act as links/buttons. */
  interactive?: boolean;
  as?: "div" | "section" | "article";
}

/**
 * The one shared elevated-surface shell for the whole portal. `DashboardWidget`
 * and `ProfileSection` render through this so every card in the app - Home,
 * Admin, Professor, Profile, and any page-authored card - shares one visual
 * language instead of each page hand-rolling its own border/radius/shadow.
 */
export function Card({
  children,
  interactive = false,
  as: Tag = "div",
  className = "",
  ...rest
}: CardProps) {
  return (
    <Tag
      className={`bg-surface border border-parchment-dim/15 rounded-lg shadow-sm shadow-black/20 transition-all duration-200 ${
        interactive ? "hover:border-gold/40 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/30" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
