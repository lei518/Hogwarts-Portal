interface QuizOptionData {
  id: string;
  label: string;
}

interface QuizStepProps {
  stepNumber: number;
  totalSteps: number;
  scenario?: string;
  prompt: string;
  options: QuizOptionData[];
  onSelect: (optionId: string) => void;
}

export function QuizStep({
  stepNumber,
  totalSteps,
  scenario,
  prompt,
  options,
  onSelect,
}: QuizStepProps) {
  return (
    <div className="w-full max-w-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-parchment-dim mb-6 text-center">
        Question {stepNumber} of {totalSteps}
      </p>

      {scenario && (
        <p className="text-parchment-dim text-center mb-3 font-body text-sm leading-relaxed">
          {scenario}
        </p>
      )}

      <h2 className="text-2xl md:text-3xl text-gold-bright text-center mb-8 font-display">
        {prompt}
      </h2>

      <div className="flex flex-col gap-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="flex items-center gap-3.5 text-left px-5 py-4 border border-parchment-dim/20 rounded-lg bg-surface hover:border-gold/50 hover:bg-surface-hover hover:-translate-y-0.5 transition-all duration-150 font-body text-parchment shadow-sm shadow-black/10"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gold/10 text-gold-bright text-sm font-medium shrink-0">
              {String.fromCharCode(65 + index)}
            </span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
