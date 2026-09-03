// Small reusable silhouette/glow primitives shared across location illustrations,
// composed in the same flat-shape + gradient style as CastleSilhouette.

interface Point {
  x: number;
  y: number;
}

export function StarField({
  color = "#e8e4da",
  opacity = 0.8,
}: {
  color?: string;
  opacity?: number;
}) {
  const positions: [number, number, number][] = [
    [20, 18, 1.2], [55, 32, 0.9], [92, 14, 1], [130, 40, 0.8], [168, 22, 1.3],
    [205, 10, 0.9], [240, 36, 1], [278, 16, 0.8], [310, 44, 1.2], [344, 20, 0.9],
    [372, 34, 1], [18, 52, 0.8], [140, 60, 0.9], [260, 58, 0.8], [360, 60, 1],
    [80, 70, 0.7], [200, 72, 0.8], [320, 74, 0.9],
  ];
  return (
    <g opacity={opacity}>
      {positions.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={color} />
      ))}
    </g>
  );
}

export function TreeCluster({
  baseline,
  color = "#0b0805",
  spread = 400,
  count = 9,
  xOffset = 0,
}: {
  baseline: number;
  color?: string;
  spread?: number;
  count?: number;
  xOffset?: number;
}) {
  const step = spread / count;
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => {
        const x = xOffset + step * i + step * 0.5 + ((i % 3) - 1) * 4;
        const height = 30 + ((i * 37) % 40);
        const width = 16 + ((i * 19) % 10);
        return (
          <polygon
            key={i}
            points={`${x},${baseline - height} ${x - width / 2},${baseline} ${x + width / 2},${baseline}`}
          />
        );
      })}
    </g>
  );
}

export function WaterRipples({
  y,
  color = "#3a5a6e",
  width = 400,
  rows = 4,
}: {
  y: number;
  color?: string;
  width?: number;
  rows?: number;
}) {
  return (
    <g stroke={color} strokeWidth={1.2} fill="none">
      {Array.from({ length: rows }, (_, i) => {
        const ry = y + i * 14;
        return (
          <path
            key={i}
            d={`M0,${ry} Q${width * 0.25},${ry - 5} ${width * 0.5},${ry} T${width},${ry}`}
            opacity={0.5 - i * 0.1}
          />
        );
      })}
    </g>
  );
}

export function WindowGlow({ points, color = "#e6c568" }: { points: Point[]; color?: string }) {
  return (
    <g fill={color} opacity={0.7}>
      {points.map(({ x, y }, i) => (
        <rect key={i} x={x} y={y} width={5} height={8} rx={0.5} />
      ))}
    </g>
  );
}

export function ArchRow({
  baseline,
  count,
  width = 400,
  color = "#c9a646",
  height = 90,
}: {
  baseline: number;
  count: number;
  width?: number;
  color?: string;
  height?: number;
}) {
  const step = width / count;
  return (
    <g fill="none" stroke={color} strokeWidth={1.5} opacity={0.55}>
      {Array.from({ length: count }, (_, i) => {
        const cx = step * i + step / 2;
        const archWidth = step * 0.55;
        return (
          <path
            key={i}
            d={`M${cx - archWidth / 2},${baseline} L${cx - archWidth / 2},${baseline - height * 0.5} Q${cx - archWidth / 2},${baseline - height} ${cx},${baseline - height} Q${cx + archWidth / 2},${baseline - height} ${cx + archWidth / 2},${baseline - height * 0.5} L${cx + archWidth / 2},${baseline}`}
          />
        );
      })}
    </g>
  );
}

export function Cauldron({
  x,
  y,
  scale = 1,
  color = "#1c1c1c",
  glow = "#6b8f5a",
}: {
  x: number;
  y: number;
  scale?: number;
  color?: string;
  glow?: string;
}) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M-22,0 Q-24,22 -12,28 L12,28 Q24,22 22,0 Z" fill={color} />
      <ellipse cx="0" cy="0" rx="22" ry="7" fill={color} />
      <ellipse cx="0" cy="0" rx="15" ry="4.5" fill={glow} opacity="0.6" />
      <path d="M-4,-6 Q-9,-17 -2,-24" stroke={glow} strokeWidth="1.4" fill="none" opacity="0.5" />
      <path d="M5,-6 Q11,-19 4,-27" stroke={glow} strokeWidth="1.4" fill="none" opacity="0.4" />
    </g>
  );
}

export function FireplaceGlow({ x, y, color = "#e0692e" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-28" y="-6" width="56" height="48" rx="2" fill="#150705" />
      <path
        d="M-14,42 Q-17,20 -4,10 Q-6,20 0,16 Q2,6 10,0 Q6,16 14,20 Q19,30 10,42 Z"
        fill={color}
        opacity="0.85"
      />
      <path d="M-7,42 Q-7,29 0,23 Q0,31 4,29 Q7,35 2,42 Z" fill="#f2b25a" opacity="0.8" />
    </g>
  );
}

export function Bookshelves({
  x,
  y,
  rows = 4,
  cols = 3,
  width = 70,
  height = 90,
  color = "#0b0805",
  accent = "#c9a646",
}: {
  x: number;
  y: number;
  rows?: number;
  cols?: number;
  width?: number;
  height?: number;
  color?: string;
  accent?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={x + 4 + c * (width / cols)}
            y={y + 6 + r * (height / rows)}
            width={width / cols - 6}
            height={height / rows - 6}
            fill={accent}
            opacity={0.15 + ((r + c) % 3) * 0.1}
          />
        ))
      )}
    </g>
  );
}

export function QuidditchHoops({ x, y, color = "#d3a625" }: { x: number; y: number; color?: string }) {
  return (
    <g stroke={color} strokeWidth="2" fill="none" opacity="0.8">
      <line x1={x} y1={y} x2={x} y2={y - 60} />
      <ellipse cx={x} cy={y - 66} rx="12" ry="6" />
      <line x1={x + 30} y1={y} x2={x + 30} y2={y - 40} />
      <ellipse cx={x + 30} cy={y - 44} rx="9" ry="4.5" />
      <line x1={x - 30} y1={y} x2={x - 30} y2={y - 76} />
      <ellipse cx={x - 30} cy={y - 80} rx="14" ry="7" />
    </g>
  );
}

export function Rooftops({
  baseline,
  count = 6,
  width = 400,
  color = "#0b0805",
}: {
  baseline: number;
  count?: number;
  width?: number;
  color?: string;
}) {
  const step = width / count;
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => {
        const x = step * i;
        const w = step * (0.7 + (i % 2) * 0.15);
        const h = 34 + ((i * 23) % 26);
        return (
          <g key={i}>
            <rect x={x} y={baseline - h} width={w} height={h} />
            <polygon
              points={`${x - 3},${baseline - h} ${x + w / 2},${baseline - h - 16} ${x + w + 3},${baseline - h}`}
            />
          </g>
        );
      })}
    </g>
  );
}

export function Vines({
  x,
  y,
  height = 100,
  color = "#4f7a5f",
}: {
  x: number;
  y: number;
  height?: number;
  color?: string;
}) {
  return (
    <g stroke={color} strokeWidth="1.6" fill="none" opacity="0.8">
      <path
        d={`M${x},${y} Q${x + 10},${y - height * 0.3} ${x - 4},${y - height * 0.55} Q${x + 12},${y - height * 0.75} ${x},${y - height}`}
      />
      {[0.2, 0.45, 0.7, 0.9].map((t, i) => (
        <circle key={i} cx={x + (i % 2 === 0 ? 6 : -4)} cy={y - height * t} r={3.5} fill={color} stroke="none" />
      ))}
    </g>
  );
}

export function FishSilhouette({
  x,
  y,
  scale = 1,
  color = "#8fae9e",
}: {
  x: number;
  y: number;
  scale?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} fill={color} opacity="0.5">
      <ellipse cx="0" cy="0" rx="10" ry="4" />
      <polygon points="-10,0 -16,-4 -16,4" />
    </g>
  );
}

export function Telescope({ x, y, color = "#0b0805" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y})`} fill={color}>
      <g transform="rotate(-25)">
        <rect x="-4" y="-44" width="8" height="44" />
        <circle cx="0" cy="-44" r="5.5" />
      </g>
      <rect x="-3" y="0" width="6" height="20" />
      <polygon points="-10,20 10,20 6,26 -6,26" />
    </g>
  );
}

export function GlowingDoorway({ x, y, color = "#9d7fd4" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M-30,90 L-30,10 Q-30,-20 0,-20 Q30,-20 30,10 L30,90 Z" fill="#0b0805" />
      <path d="M-22,90 L-22,12 Q-22,-10 0,-10 Q22,-10 22,12 L22,90 Z" fill={color} opacity="0.35" />
      <path d="M-10,90 L-10,20 Q-10,4 0,4 Q10,4 10,20 L10,90 Z" fill={color} opacity="0.75" />
    </g>
  );
}

export function DomedCeiling({
  cx,
  cy,
  r = 100,
  color = "#946b2d",
}: {
  cx: number;
  cy: number;
  r?: number;
  color?: string;
}) {
  return (
    <g>
      <path d={`M${cx - r},${cy} A${r},${r * 0.55} 0 0 1 ${cx + r},${cy} Z`} fill="#0b0805" />
      <path
        d={`M${cx - r},${cy} A${r},${r * 0.55} 0 0 1 ${cx + r},${cy}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle cx={cx - r * 0.4} cy={cy - r * 0.42} r="1.4" fill={color} opacity="0.7" />
      <circle cx={cx} cy={cy - r * 0.5} r="1.6" fill={color} opacity="0.8" />
      <circle cx={cx + r * 0.35} cy={cy - r * 0.4} r="1.3" fill={color} opacity="0.6" />
      <circle cx={cx - r * 0.15} cy={cy - r * 0.25} r="1" fill={color} opacity="0.5" />
      <circle cx={cx + r * 0.15} cy={cy - r * 0.28} r="1" fill={color} opacity="0.5" />
    </g>
  );
}

export function DeskRow({
  y,
  count = 5,
  width = 400,
  color = "#0b0805",
}: {
  y: number;
  count?: number;
  width?: number;
  color?: string;
}) {
  const step = width / count;
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => (
        <rect key={i} x={step * i + step * 0.15} y={y} width={step * 0.7} height={14} rx={1.5} />
      ))}
    </g>
  );
}

export function ShieldEmblem({
  x,
  y,
  scale = 1,
  color = "#5c7a7a",
}: {
  x: number;
  y: number;
  scale?: number;
  color?: string;
}) {
  return (
    <g
      transform={`translate(${x},${y}) scale(${scale})`}
      stroke={color}
      strokeWidth="1.6"
      fill="none"
      opacity="0.7"
    >
      <path d="M0,-30 L26,-18 L26,10 Q26,30 0,42 Q-26,30 -26,10 L-26,-18 Z" />
      <path d="M0,-18 L0,26" opacity="0.5" />
    </g>
  );
}
