import type { LabelHTMLAttributes } from "react";

export function Label({ className = "", ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-[11px] font-medium uppercase tracking-wide text-parchment-dim mb-1.5 ${className}`}
      {...rest}
    />
  );
}
