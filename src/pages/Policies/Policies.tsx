import { useMemo, useState } from "react";
import { ScrollText } from "lucide-react";
import { policies, policyCategories } from "../../data/policies";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
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
      <PageHeader
        title="School Policies"
        description="Rules and guidelines every student agrees to on enrollment."
        icon={ScrollText}
      />

      <div className="flex flex-wrap gap-2 my-6">
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
              className="text-left bg-surface border border-parchment-dim/15 rounded-lg px-5 py-4 shadow-sm shadow-black/20 hover:border-gold/40 transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="font-display text-lg text-parchment">{policy.title}</p>
                <Badge className="shrink-0">{policy.category}</Badge>
              </div>
              <p className="text-parchment-dim text-sm">{expanded ? policy.body : policy.summary}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
