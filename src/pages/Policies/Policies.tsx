import { useMemo, useState } from "react";
import { policies, policyCategories } from "../../data/policies";
import type { PolicyCategory } from "../../types/resources";

export function PoliciesPage() {
  const [filter, setFilter] = useState<PolicyCategory | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "All" ? policies : policies.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📜 School Policies</h1>
      <p className="text-parchment-dim text-sm mb-6">Rules and guidelines every student agrees to on enrollment.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["All", ...policyCategories] as const).map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
              filter === option
                ? "border-gold text-gold-bright bg-gold/10"
                : "border-parchment-dim/25 text-parchment-dim hover:border-gold/50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((policy) => {
          const expanded = expandedId === policy.id;
          return (
            <button
              key={policy.id}
              onClick={() => setExpandedId(expanded ? null : policy.id)}
              className="text-left border border-parchment-dim/20 rounded-sm px-5 py-4 hover:border-gold transition-colors duration-150"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="font-display text-lg text-parchment">{policy.title}</p>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-parchment-dim/25 text-parchment-dim shrink-0">
                  {policy.category}
                </span>
              </div>
              <p className="text-parchment-dim text-sm">{expanded ? policy.body : policy.summary}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
