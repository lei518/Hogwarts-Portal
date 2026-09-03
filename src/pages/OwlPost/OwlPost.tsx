import { useMemo, useState } from "react";
import { useGame } from "../../context/GameContext";
import { Button } from "../../components/ui/Button";
import { OwlPostMessageCard } from "../../components/owlPost/OwlPostMessageCard";
import type { OwlPostCategory } from "../../types/owlPost";

const CATEGORIES: OwlPostCategory[] = ["Admissions", "Professors", "School", "House", "Personal"];

export function OwlPostInboxPage() {
  const { state, dispatch } = useGame();
  const { character } = state;
  const [filter, setFilter] = useState<OwlPostCategory | "All">("All");

  const messages = useMemo(() => {
    if (!character) return [];
    const sorted = [...character.owlPost].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return filter === "All" ? sorted : sorted.filter((m) => m.category === filter);
  }, [character, filter]);

  if (!character) return null;

  const unreadCount = character.owlPost.filter((m) => !m.read).length;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright">🦉 Owl Post</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={() => dispatch({ type: "MARK_ALL_OWL_POST_READ" })}>
            Mark All Read
          </Button>
        )}
      </div>
      <p className="text-parchment-dim text-sm mb-6">
        {unreadCount > 0
          ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}.`
          : "You're all caught up."}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["All", ...CATEGORIES] as const).map((option) => (
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

      {messages.length === 0 ? (
        <p className="text-parchment-dim text-sm border border-parchment-dim/15 rounded-sm px-5 py-8 text-center">
          No messages {filter === "All" ? "yet" : `in ${filter}`}. Owls will deliver your letters here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map((message) => (
            <OwlPostMessageCard
              key={message.id}
              message={message}
              onOpen={(id) => dispatch({ type: "MARK_OWL_POST_READ", payload: id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
