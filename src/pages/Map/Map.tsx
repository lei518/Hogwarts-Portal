import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map as MapIcon, User } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { locations, getLocation } from "../../data/locations";
import { initialNpcs, wanderableLocationIds, type Npc } from "../../data/npcs";
import { PageHeader } from "../../components/ui/PageHeader";

function connectionPairs() {
  const seen = new Set<string>();
  const pairs: { from: string; to: string }[] = [];
  for (const loc of locations) {
    for (const targetId of loc.connections) {
      const key = [loc.id, targetId].sort().join("::");
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ from: loc.id, to: targetId });
    }
  }
  return pairs;
}

const pairs = connectionPairs();

// The spatial/exploration view - a location marker navigates to its detail
// page (see LocationDetail.tsx) rather than launching gameplay inline, so
// this page only needs to know about positions and who's currently where.
export function MapPage() {
  const { state } = useGame();
  const navigate = useNavigate();
  const [selectedNpc, setSelectedNpc] = useState<Npc | null>(null);
  const [npcs, setNpcs] = useState<Npc[]>(initialNpcs);

  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setNpcs((current) => {
        const index = Math.floor(Math.random() * current.length);
        const nextLocation =
          wanderableLocationIds[Math.floor(Math.random() * wanderableLocationIds.length)];
        return current.map((npc, i) =>
          i === index ? { ...npc, locationId: nextLocation } : npc
        );
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
      <div className="mb-4">
        <PageHeader
          title="Campus Map"
          description="An interactive directory of the grounds and castle."
          icon={MapIcon}
          action={
            <p className="text-parchment-dim text-xs">
              {state.character!.discoveredLocations.length} / {locations.length} discovered
            </p>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div
          className="relative rounded-lg border border-gold/25 overflow-hidden"
          style={{
            aspectRatio: "4 / 5",
            background:
              "radial-gradient(ellipse at 50% 40%, #2a2013 0%, #1c150c 60%, #130d07 100%)",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            {pairs.map(({ from, to }) => {
              const a = getLocation(from);
              const b = getLocation(to);
              if (!a || !b) return null;
              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#c9a646"
                  strokeOpacity={0.35}
                  strokeWidth={0.3}
                />
              );
            })}
          </svg>

          {locations.map((loc) => {
            const isDiscovered = state.character!.discoveredLocations.includes(loc.id);
            return (
              <button
                key={loc.id}
                onClick={() => navigate(`/map/${loc.id}`)}
                aria-label={loc.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group"
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              >
                <span
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-base border transition-all group-hover:scale-110 ${
                    isDiscovered
                      ? "border-gold/60 bg-void/70"
                      : "border-parchment-dim/40 bg-void/70"
                  }`}
                >
                  {loc.emoji}
                </span>
                <span className="hidden md:block text-[10px] text-parchment-dim group-hover:text-gold-bright whitespace-nowrap px-1">
                  {loc.name}
                </span>
              </button>
            );
          })}

          {npcs.map((npc) => {
            const loc = getLocation(npc.locationId);
            if (!loc) return null;
            return (
              <button
                key={npc.id}
                onClick={() => setSelectedNpc(npc)}
                aria-label={`${npc.name}, ${npc.role}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-sm rounded-full bg-ink/80 border border-parchment-dim/30 transition-[left,top] duration-[2000ms] ease-in-out hover:border-gold"
                style={{ left: `${loc.x}%`, top: `${loc.y}%`, marginTop: "-16px" }}
              >
                {npc.emoji}
              </button>
            );
          })}
        </div>

        <aside className="bg-surface border border-parchment-dim/15 rounded-lg shadow-sm shadow-black/20 p-5 min-h-[200px]">
          {!selectedNpc && (
            <p className="text-parchment-dim text-sm">
              Select a location to open its directory page, or a moving figure to see who they are.
            </p>
          )}

          {selectedNpc && (
            <div>
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 text-gold-bright mb-3">
                <User size={18} />
              </span>
              <h2 className="font-display text-xl text-gold-bright mb-1">{selectedNpc.name}</h2>
              <p className="text-parchment-dim text-sm mb-4">{selectedNpc.role}</p>
              <p className="text-parchment-dim text-xs uppercase tracking-wide mb-1">
                Currently at
              </p>
              <p className="text-parchment text-sm">
                {getLocation(selectedNpc.locationId)?.name}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
