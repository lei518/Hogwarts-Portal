import { useId, type ReactNode } from "react";

interface IllustrationFrameProps {
  children: ReactNode;
  from: string;
  to: string;
  accent: string;
}

export function IllustrationFrame({ children, from, to, accent }: IllustrationFrameProps) {
  const gradId = useId();

  return (
    <div
      className="relative rounded-sm border border-gold/25 overflow-hidden"
      style={{ aspectRatio: "16 / 10" }}
    >
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`bg-${gradId}`} cx="50%" cy="35%" r="75%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </radialGradient>
          <linearGradient id={`rim-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`fade-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="65%" stopColor="#0b0805" stopOpacity="0" />
            <stop offset="100%" stopColor="#0b0805" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="400" height="240" fill={`url(#bg-${gradId})`} />
        {children}
        <rect x="0" y="0" width="400" height="240" fill={`url(#rim-${gradId})`} opacity="0.5" />
        <rect x="0" y="0" width="400" height="240" fill={`url(#fade-${gradId})`} />
      </svg>
    </div>
  );
}
