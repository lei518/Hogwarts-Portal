import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const fieldBase =
  "w-full bg-void/40 border rounded-md px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment-dim/50 outline-none transition-colors duration-150";

const fieldBorder = (error?: boolean) =>
  error
    ? "border-ember focus:border-ember focus:ring-2 focus:ring-ember/20"
    : "border-parchment-dim/25 focus:border-gold focus:ring-2 focus:ring-gold/15";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = "", ...rest }: InputProps) {
  return <input className={`${fieldBase} ${fieldBorder(error)} ${className}`} {...rest} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className = "", children, ...rest }: SelectProps) {
  return (
    <select className={`${fieldBase} ${fieldBorder(error)} ${className}`} {...rest}>
      {children}
    </select>
  );
}
