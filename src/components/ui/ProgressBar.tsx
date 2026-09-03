interface ProgressBarProps {
  value: number; // 0-100
  colorClass?: string;
  trackClassName?: string;
  label?: string;
}

export function ProgressBar({
  value,
  colorClass = "bg-gold",
  trackClassName = "bg-parchment-dim/15",
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-parchment-dim mb-1">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className={`h-2 w-full rounded-full overflow-hidden ${trackClassName}`}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
