import type { ReactNode } from "react";
import { Label } from "./Label";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  /** Muted hint shown under the field when there is no error. */
  helperText?: string;
  /** Shown instead of helperText, styled as an error, when set. */
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Composes a Label + field + helper/error text with consistent spacing. Wrap an Input/Select in it. */
export function FormField({ label, htmlFor, helperText, error, className = "", children }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-ember">
          {error}
        </p>
      ) : (
        helperText && <p className="mt-1.5 text-xs text-parchment-dim/70">{helperText}</p>
      )}
    </div>
  );
}
