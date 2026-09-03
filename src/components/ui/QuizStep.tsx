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
            className="text-left px-5 py-4 border border-parchment-dim/30 rounded-sm bg-void/40 hover:border-gold hover:bg-void/70 transition-colors duration-150 font-body text-parchment"
          >
            <span className="text-gold-bright mr-3">
              {String.fromCharCode(65 + index)}.
            </span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
