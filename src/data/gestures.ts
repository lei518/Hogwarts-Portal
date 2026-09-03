export interface GesturePoint {
  x: number; // normalized 0-1
  y: number; // normalized 0-1, downward
}

export interface Gesture {
  spellId: string;
  label: string;
  points: GesturePoint[];
}

export const gestures: Gesture[] = [
  {
    spellId: "lumos",
    label: "Upward Flick",
    points: [
      { x: 0.5, y: 0.85 },
      { x: 0.5, y: 0.15 },
    ],
  },
  {
    spellId: "nox",
    label: "Downward Flick",
    points: [
      { x: 0.5, y: 0.15 },
      { x: 0.5, y: 0.85 },
    ],
  },
  {
    spellId: "accio",
    label: "Inward Hook",
    points: [
      { x: 0.75, y: 0.2 },
      { x: 0.55, y: 0.35 },
      { x: 0.35, y: 0.55 },
      { x: 0.3, y: 0.8 },
    ],
  },
  {
    spellId: "reparo",
    label: "Checkmark",
    points: [
      { x: 0.2, y: 0.3 },
      { x: 0.4, y: 0.75 },
      { x: 0.8, y: 0.15 },
    ],
  },
  {
    spellId: "wingardium-leviosa",
    label: "S-Curve",
    points: [
      { x: 0.2, y: 0.85 },
      { x: 0.65, y: 0.7 },
      { x: 0.35, y: 0.3 },
      { x: 0.8, y: 0.15 },
    ],
  },
  {
    spellId: "alohomora",
    label: "Key Twist",
    points: [
      { x: 0.5, y: 0.25 },
      { x: 0.75, y: 0.35 },
      { x: 0.8, y: 0.6 },
      { x: 0.6, y: 0.82 },
      { x: 0.35, y: 0.75 },
    ],
  },
  {
    spellId: "protego",
    label: "Full Circle",
    points: [
      { x: 0.5, y: 0.18 },
      { x: 0.73, y: 0.27 },
      { x: 0.82, y: 0.5 },
      { x: 0.73, y: 0.73 },
      { x: 0.5, y: 0.82 },
      { x: 0.27, y: 0.73 },
      { x: 0.18, y: 0.5 },
      { x: 0.27, y: 0.27 },
      { x: 0.5, y: 0.18 },
    ],
  },
  {
    spellId: "expelliarmus",
    label: "Diagonal Slash",
    points: [
      { x: 0.2, y: 0.8 },
      { x: 0.8, y: 0.2 },
    ],
  },
  {
    spellId: "stupefy",
    label: "Zigzag Bolt",
    points: [
      { x: 0.1, y: 0.5 },
      { x: 0.35, y: 0.15 },
      { x: 0.5, y: 0.6 },
      { x: 0.65, y: 0.15 },
      { x: 0.9, y: 0.5 },
    ],
  },
  {
    spellId: "expecto-patronum",
    label: "Sweeping Loop",
    points: [
      { x: 0.5, y: 0.85 },
      { x: 0.15, y: 0.55 },
      { x: 0.3, y: 0.2 },
      { x: 0.7, y: 0.2 },
      { x: 0.85, y: 0.55 },
      { x: 0.5, y: 0.8 },
    ],
  },
  {
    spellId: "expecto-patronum-corporeal",
    label: "Figure Eight",
    points: [
      { x: 0.5, y: 0.5 },
      { x: 0.25, y: 0.3 },
      { x: 0.5, y: 0.15 },
      { x: 0.75, y: 0.3 },
      { x: 0.5, y: 0.5 },
      { x: 0.75, y: 0.7 },
      { x: 0.5, y: 0.85 },
      { x: 0.25, y: 0.7 },
      { x: 0.5, y: 0.5 },
    ],
  },
];

export function getGesture(spellId: string): Gesture | undefined {
  return gestures.find((g) => g.spellId === spellId);
}
