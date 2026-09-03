import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import {
  GENDER_OPTIONS,
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_COLORS,
} from "../../data/characterOptions";
import type { Gender } from "../../types/character";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { createInitialCharacter } from "../../utils/character";

const TOTAL_STEPS = 2;

export function CharacterCreation() {
  const navigate = useNavigate();
  const { dispatch } = useGame();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);

  // A character can only be created while signed in - JourneyGate already
  // enforces this, this is the same defense-in-depth pattern every other
  // onboarding page uses for its own precondition.
  useEffect(() => {
    if (!loading && !user) {
      navigate("/authenticate", { replace: true });
    }
  }, [loading, user, navigate]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("unspecified");
  const [year, setYear] = useState(1);

  const [skinTone, setSkinTone] = useState(SKIN_TONES[2]);
  const [hairStyle, setHairStyle] = useState(HAIR_STYLES[0]);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[1]);
  const [eyeColor, setEyeColor] = useState(EYE_COLORS[0]);

  function handleContinue() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    const character = createInitialCharacter({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      year,
      appearance: { skinTone, hairStyle, hairColor, eyeColor },
    });

    dispatch({ type: "CREATE_CHARACTER", payload: character });
    navigate("/acceptance-letter");
  }

  const canContinueStep1 = firstName.trim().length > 0 && lastName.trim().length > 0;

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <p className="text-center text-parchment-dim text-xs uppercase tracking-[0.3em] mb-1">
          Student Enrollment
        </p>
        <p className="text-center text-parchment-dim text-xs uppercase tracking-[0.2em] mb-2">
          Step {step} of {TOTAL_STEPS}
        </p>
        <ProgressBar value={(step / TOTAL_STEPS) * 100} />

        {step === 1 && (
          <section className="mt-10">
            <h1 className="text-3xl text-gold-bright mb-1 text-center">Your Identity</h1>
            <p className="text-parchment-dim text-sm text-center mb-8">
              Every Hogwarts story starts with a name.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Field label="First name" className="flex-1">
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Harry"
                    className={inputClass}
                    autoFocus
                  />
                </Field>

                <Field label="Last name" className="flex-1">
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Potter"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="flex gap-4">
                <Select
                  label="Gender"
                  value={gender}
                  options={GENDER_OPTIONS.map((o) => o.value)}
                  optionLabels={GENDER_OPTIONS.map((o) => o.label)}
                  onChange={(v) => setGender(v as Gender)}
                  className="flex-1"
                />

                <Field label="Hogwarts year" className="flex-1">
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className={inputClass}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-10">
            <h1 className="text-3xl text-gold-bright mb-1 text-center">Your Appearance</h1>
            <p className="text-parchment-dim text-sm text-center mb-8">
              How do you look, standing in front of the mirror?
            </p>

            <div className="flex flex-col gap-4">
              <Select label="Skin tone" value={skinTone} options={SKIN_TONES} onChange={setSkinTone} />
              <Select label="Hair style" value={hairStyle} options={HAIR_STYLES} onChange={setHairStyle} />
              <Select label="Hair color" value={hairColor} options={HAIR_COLORS} onChange={setHairColor} />
              <Select label="Eye color" value={eyeColor} options={EYE_COLORS} onChange={setEyeColor} />
            </div>
          </section>
        )}

        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}

          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={step === 1 && !canContinueStep1}
            className="disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === TOTAL_STEPS ? "Continue to Your Letter" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-void/50 border border-parchment-dim/30 rounded-sm px-4 py-2.5 text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs uppercase tracking-wide text-parchment-dim mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  label,
  value,
  options,
  optionLabels,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: string[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((opt, i) => (
          <option key={opt} value={opt}>
            {optionLabels?.[i] ?? opt}
          </option>
        ))}
      </select>
    </Field>
  );
}
