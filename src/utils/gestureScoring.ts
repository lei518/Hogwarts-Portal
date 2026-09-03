import type { GesturePoint } from "../data/gestures";

const MIN_TURN_DEGREES = 12;

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function distance(a: GesturePoint, b: GesturePoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

// Drops points too close to the last kept one, smoothing pointer jitter without losing real corners.
export function downsample(points: GesturePoint[], minSpacing = 0.015): GesturePoint[] {
  if (points.length === 0) return points;
  const kept: GesturePoint[] = [points[0]];
  for (const point of points.slice(1)) {
    if (distance(kept[kept.length - 1], point) >= minSpacing) {
      kept.push(point);
    }
  }
  const last = points[points.length - 1];
  if (distance(kept[kept.length - 1], last) > 0) kept.push(last);
  return kept;
}

interface GestureFeatures {
  direction: GesturePoint;
  aspect: number;
  totalAbsRotation: number;
  netRotation: number;
  signChanges: number;
}

function extractFeatures(points: GesturePoint[]): GestureFeatures {
  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const mag = Math.hypot(dx, dy) || 1;
  const direction: GesturePoint = { x: dx / mag, y: dy / mag };

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const aspect = width + height === 0 ? 0.5 : width / (width + height);

  const turns: number[] = [];
  for (let i = 1; i < points.length - 1; i++) {
    const v1 = { x: points[i].x - points[i - 1].x, y: points[i].y - points[i - 1].y };
    const v2 = { x: points[i + 1].x - points[i].x, y: points[i + 1].y - points[i].y };
    const m1 = Math.hypot(v1.x, v1.y);
    const m2 = Math.hypot(v2.x, v2.y);
    if (m1 < 1e-6 || m2 < 1e-6) continue;
    const cross = v1.x * v2.y - v1.y * v2.x;
    const dot = v1.x * v2.x + v1.y * v2.y;
    const angle = toDegrees(Math.atan2(cross, dot));
    if (Math.abs(angle) >= MIN_TURN_DEGREES) turns.push(angle);
  }

  let totalAbsRotation = 0;
  let netRotation = 0;
  let signChanges = 0;
  let lastSign = 0;
  for (const turn of turns) {
    totalAbsRotation += Math.abs(turn);
    netRotation += turn;
    const sign = turn > 0 ? 1 : -1;
    if (lastSign !== 0 && sign !== lastSign) signChanges++;
    lastSign = sign;
  }

  return { direction, aspect, totalAbsRotation, netRotation, signChanges };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// Feature-based comparison (direction, turning signature, bounding-box aspect) rather than
// point-by-point path matching, so near misses still score reasonably instead of being punished.
export function scoreGesture(drawnRaw: GesturePoint[], reference: GesturePoint[]): number {
  const drawn = downsample(drawnRaw);
  if (drawn.length < 2) return 0.25;

  const drawnFeatures = extractFeatures(drawn);
  const refFeatures = extractFeatures(reference);

  const cosineSimilarity =
    drawnFeatures.direction.x * refFeatures.direction.x +
    drawnFeatures.direction.y * refFeatures.direction.y;
  const directionScore = clamp01((cosineSimilarity + 1) / 2);

  const aspectScore = clamp01(1 - Math.abs(drawnFeatures.aspect - refFeatures.aspect));

  const rotationScore = clamp01(
    1 - Math.abs(drawnFeatures.totalAbsRotation - refFeatures.totalAbsRotation) / 360
  );
  const signChangeScore = clamp01(
    1 - Math.abs(drawnFeatures.signChanges - refFeatures.signChanges) / 3
  );
  const drawnCancel =
    drawnFeatures.totalAbsRotation > 0
      ? Math.abs(drawnFeatures.netRotation) / drawnFeatures.totalAbsRotation
      : 1;
  const refCancel =
    refFeatures.totalAbsRotation > 0
      ? Math.abs(refFeatures.netRotation) / refFeatures.totalAbsRotation
      : 1;
  const cancelScore = clamp01(1 - Math.abs(drawnCancel - refCancel));

  const turnScore = (rotationScore + signChangeScore + cancelScore) / 3;

  const shapeScore = 0.4 * directionScore + 0.35 * turnScore + 0.25 * aspectScore;

  // Floor so a genuine attempt is never punished harder than simply skipping the gesture.
  return clamp01(Math.max(0.25, shapeScore));
}

export type GestureQuality = "Flawless" | "Clean" | "Rough" | "Off";

export function getGestureQuality(score: number): GestureQuality {
  if (score >= 0.85) return "Flawless";
  if (score >= 0.65) return "Clean";
  if (score >= 0.45) return "Rough";
  return "Off";
}
