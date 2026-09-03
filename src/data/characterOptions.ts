import type { Gender } from "../types/character";

// Character Creation's option lists - kept separate from the component so
// choices can be added or reworded without touching any React code.
export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "unspecified", label: "Prefer not to say" },
];

export const SKIN_TONES = ["Fair", "Light", "Medium", "Tan", "Deep", "Dark"];

export const HAIR_STYLES = ["Short", "Long", "Curly", "Wavy", "Braided", "Bald"];

export const HAIR_COLORS = ["Black", "Brown", "Blonde", "Red", "Auburn", "Gray", "White"];

export const EYE_COLORS = ["Brown", "Blue", "Green", "Hazel", "Gray", "Amber"];
