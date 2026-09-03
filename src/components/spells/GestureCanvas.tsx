import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Gesture, GesturePoint } from "../../data/gestures";

interface GestureCanvasProps {
  gesture: Gesture;
  color: string;
  disabled: boolean;
  onComplete: (points: GesturePoint[]) => void;
}

// A stroke must cover at least this fraction of the canvas diagonal to count as a real attempt,
// so a stray tap resets quietly instead of scoring (and casting) as a bad gesture.
const MIN_PATH_LENGTH = 0.18;

function toSmoothPath(points: GesturePoint[]): string {
  if (points.length === 0) return "";
  const scaled = points.map((p) => ({ x: p.x * 100, y: p.y * 100 }));
  if (scaled.length < 3) {
    return scaled.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  }
  let d = `M${scaled[0].x.toFixed(1)},${scaled[0].y.toFixed(1)}`;
  for (let i = 0; i < scaled.length - 1; i++) {
    const curr = scaled[i];
    const next = scaled[i + 1];
    const mid = { x: (curr.x + next.x) / 2, y: (curr.y + next.y) / 2 };
    d += ` Q${curr.x.toFixed(1)},${curr.y.toFixed(1)} ${mid.x.toFixed(1)},${mid.y.toFixed(1)}`;
  }
  const lastPoint = scaled[scaled.length - 1];
  d += ` L${lastPoint.x.toFixed(1)},${lastPoint.y.toFixed(1)}`;
  return d;
}

export function GestureCanvas({ gesture, color, disabled, onComplete }: GestureCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<GesturePoint[]>([]);

  function toNormalizedPoint(clientX: number, clientY: number): GesturePoint | null {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (disabled) return;
    const point = toNormalizedPoint(event.clientX, event.clientY);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrawing(true);
    setPoints([point]);
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!drawing || disabled) return;
    const point = toNormalizedPoint(event.clientX, event.clientY);
    if (!point) return;
    setPoints((prev) => [...prev, point]);
  }

  function finishStroke() {
    if (!drawing) return;
    setDrawing(false);

    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
      totalLength += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }

    if (points.length < 3 || totalLength < MIN_PATH_LENGTH) {
      setPoints([]);
      return;
    }

    onComplete(points);
    setPoints([]);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        role="img"
        aria-label={`Gesture drawing area for ${gesture.label}. Optional, pointer or touch only.`}
        className={`w-48 h-48 rounded-full border border-gold/25 bg-void/40 touch-none ${
          disabled ? "opacity-40 pointer-events-none" : "cursor-crosshair"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
      >
        <path
          d={toSmoothPath(gesture.points)}
          fill="none"
          stroke="#b5a37e"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          strokeLinecap="round"
          opacity={0.5}
        />
        <circle
          cx={gesture.points[0].x * 100}
          cy={gesture.points[0].y * 100}
          r={2.2}
          fill="#c9a646"
          opacity={0.7}
        />

        {points.length > 1 && (
          <polyline
            points={points.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <p className="text-parchment-dim text-xs">{gesture.label}</p>
    </div>
  );
}
