import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Wand2 } from "lucide-react";
import { spells, spellCategories, type SpellCategory } from "../../data/spells";
import { useGame } from "../../context/GameContext";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";

// Phase 4 - Spell Archive: a searchable reference collection, not a
// progression system. No difficulty rating, mana cost, or locked state -
// every spell is browsable regardless of year; `requiredYear` is shown as
// informational curriculum metadata only.
export function SpellsPage() {
  const { state } = useGame();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SpellCategory | "All">("All");

  const filtered = useMemo(() => {
    return spells.filter((spell) => {
      if (category !== "All" && spell.category !== category) return false;
      if (search.trim() && !spell.name.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [search, category]);

  const studiedIds = new Set(
    (state.character?.spellbook ?? []).filter((s) => s.studied).map((s) => s.spellId)
  );

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <PageHeader
        title="Spell Archive"
        description="Search and study the spells taught at Hogwarts."
        icon={Wand2}
      />

      <div className="flex flex-col sm:flex-row gap-3 my-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment-dim/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spells..."
            aria-label="Search spells"
            className="w-full bg-void/50 border border-parchment-dim/30 rounded-md pl-10 pr-4 py-2.5 text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategory("All")}
          className={`text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
            category === "All"
              ? "border-gold text-gold-bright bg-gold/10"
              : "border-parchment-dim/25 text-parchment-dim hover:border-gold/50"
          }`}
        >
          All
        </button>
        {spellCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
              category === c
                ? "border-gold text-gold-bright bg-gold/10"
                : "border-parchment-dim/25 text-parchment-dim hover:border-gold/50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-parchment-dim text-sm mb-4">
        {filtered.length} spell{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} message="No spells match your search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((spell) => (
            <Link key={spell.id} to={`/spells/${spell.id}`}>
              <Card interactive className="px-5 py-4 h-full flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-display text-lg text-parchment">{spell.name}</p>
                  {studiedIds.has(spell.id) && <Badge tone="emerald">Studied</Badge>}
                </div>
                <Badge className="w-fit mb-2">{spell.category}</Badge>
                <p className="text-parchment-dim text-sm">{spell.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
