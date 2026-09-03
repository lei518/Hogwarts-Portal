import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface BookProps {
  left: ReactNode;
  right: ReactNode;
  pageLabel: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  transitionKey: string | number;
}

export function Book({
  left,
  right,
  pageLabel,
  onPrev,
  onNext,
  canPrev,
  canNext,
  transitionKey,
}: BookProps) {
  return (
    <div>
      <div className="relative rounded-sm border border-gold/25 bg-void/40 overflow-hidden">
        <div
          key={transitionKey}
          className="grid grid-cols-1 md:grid-cols-2 animate-[pageTurn_0.3s_ease-out]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 25%, rgba(216,196,154,0.06) 0%, rgba(216,196,154,0) 70%)",
          }}
        >
          <div className="px-6 md:px-8 py-8 flex flex-col border-b md:border-b-0 md:border-r border-gold/15 min-h-70">
            {left}
          </div>
          <div className="px-6 md:px-8 py-8 flex flex-col min-h-70">{right}</div>
        </div>

        <div
          className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-linear-to-b from-transparent via-gold/30 to-transparent"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous page"
          className="flex items-center gap-1 text-sm text-parchment-dim hover:text-gold-bright disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-parchment-dim transition-colors"
        >
          <ChevronLeft size={18} /> Prev
        </button>
        <p className="text-xs text-parchment-dim uppercase tracking-[0.2em]">{pageLabel}</p>
        <button
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next page"
          className="flex items-center gap-1 text-sm text-parchment-dim hover:text-gold-bright disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-parchment-dim transition-colors"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

      <style>{`
        @keyframes pageTurn {
          from { opacity: 0; transform: translateX(10px) rotateY(-3deg); }
          to { opacity: 1; transform: translateX(0) rotateY(0); }
        }
      `}</style>
    </div>
  );
}
