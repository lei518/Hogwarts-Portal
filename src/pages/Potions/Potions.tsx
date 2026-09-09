import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, FlaskConical } from "lucide-react";
import { potions } from "../../data/potions";
import { useGame } from "../../context/GameContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";

// Phase 4 - Potion Archive: a searchable laboratory reference, not a
// brewing minigame. No quiz score, difficulty rating, or unlock
// requirement - every potion is browsable regardless of year;
// `requiredYear` is shown as informational curriculum metadata only.
export function PotionsPage() {
  const { state } = useGame();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return potions;
    const query = search.trim().toLowerCase();
    return potions.filter((potion) => potion.name.toLowerCase().includes(query));
  }, [search]);

  const studiedIds = new Set(
    Object.values(state.character?.potionProgress ?? {})
      .filter((p) => p.studied)
      .map((p) => p.potionId)
  );

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <PageHeader
        title="Potion Archive"
        description="Search and study the potions brewed at Hogwarts."
        icon={FlaskConical}
      />

      <div className="relative my-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment-dim/60" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search potions..."
          aria-label="Search potions"
          className="w-full bg-void/50 border border-parchment-dim/30 rounded-md pl-10 pr-4 py-2.5 text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none"
        />
      </div>

      <p className="text-parchment-dim text-sm mb-4">
        {filtered.length} potion{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} message="No potions match your search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((potion) => (
            <Link key={potion.id} to={`/potions/${potion.id}`}>
              <Card interactive className="px-5 py-4 h-full flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-display text-lg text-parchment">{potion.name}</p>
                  {studiedIds.has(potion.id) && <Badge tone="emerald">Studied</Badge>}
                </div>
                <p className="text-parchment-dim text-sm">{potion.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
