import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "px-8 py-3 font-body text-sm tracking-wide transition-colors duration-200 rounded-sm border";

  const variants = {
    primary:
      "bg-gold text-ink border-gold hover:bg-gold-bright hover:border-gold-bright",
    secondary:
      "bg-transparent text-parchment border-parchment-dim/50 hover:border-gold hover:text-gold",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
