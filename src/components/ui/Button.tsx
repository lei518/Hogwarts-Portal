import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-sm",
};

const variants = {
  primary:
    "bg-gold text-ink border-gold shadow-sm shadow-black/20 hover:bg-gold-bright hover:border-gold-bright hover:-translate-y-px",
  secondary:
    "bg-transparent text-parchment border-parchment-dim/40 hover:border-gold hover:text-gold-bright hover:-translate-y-px",
  outline:
    "bg-transparent text-gold-bright border-gold/50 hover:bg-gold/10 hover:border-gold hover:-translate-y-px",
  ghost:
    "bg-transparent text-parchment-dim border-transparent hover:bg-parchment-dim/10 hover:text-parchment",
  danger:
    "bg-ember text-parchment border-ember shadow-sm shadow-black/20 hover:bg-ember/85 hover:-translate-y-px",
};

export function Button({
  children,
  variant = "primary",
  size = "lg",
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-body font-medium tracking-wide rounded-md border transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:translate-y-0";

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
