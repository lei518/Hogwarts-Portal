import { useMemo } from "react";

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
}

interface Mote {
  id: number;
  left: string;
  delay: string;
  duration: string;
  drift: string;
}

function seededStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${Math.random() * 55}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() < 0.15 ? 2 : 1,
    delay: `${(Math.random() * 6).toFixed(2)}s`,
    duration: `${(3 + Math.random() * 4).toFixed(2)}s`,
  }));
}

function seededMotes(count: number): Mote[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${(Math.random() * 10).toFixed(2)}s`,
    duration: `${(12 + Math.random() * 10).toFixed(2)}s`,
    drift: `${(Math.random() * 60 - 30).toFixed(0)}px`,
  }));
}

export function AtmosphereField() {
  const stars = useMemo(() => seededStars(70), []);
  const motes = useMemo(() => seededMotes(18), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-parchment motion-safe:animate-[twinkle_var(--d)_ease-in-out_infinite]"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: 0.6,
            animationDelay: star.delay,
            // @ts-expect-error custom property for animation duration
            "--d": star.duration,
          }}
        />
      ))}

      {motes.map((mote) => (
        <span
          key={mote.id}
          className="absolute bottom-0 w-[3px] h-[3px] rounded-full bg-gold-bright/70 motion-safe:animate-[drift-up_var(--dur)_linear_infinite]"
          style={{
            left: mote.left,
            animationDelay: mote.delay,
            // @ts-expect-error custom properties for animation
            "--dur": mote.duration,
            "--drift": mote.drift,
          }}
        />
      ))}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.85; }
        }
        @keyframes drift-up {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.4; }
          100% { transform: translate(var(--drift), -420px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
