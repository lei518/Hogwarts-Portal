import { useState } from "react";
import type { OwlPostMessage } from "../../types/owlPost";
import { CategoryBadge } from "./CategoryBadge";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface OwlPostMessageCardProps {
  message: OwlPostMessage;
  onOpen?: (id: string) => void;
}

// The one place a message's read/unread + expand behavior lives - the
// Inbox page just renders a list of these, it doesn't own this logic.
export function OwlPostMessageCard({ message, onOpen }: OwlPostMessageCardProps) {
  const [expanded, setExpanded] = useState(false);

  function handleClick() {
    setExpanded((e) => !e);
    if (!message.read) onOpen?.(message.id);
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left border rounded-sm px-4 py-3 transition-colors duration-150 ${
        message.read
          ? "border-parchment-dim/15 bg-transparent"
          : "border-gold/40 bg-gold/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          {!message.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold-bright shrink-0" aria-label="Unread" />
          )}
          <p className="font-display text-parchment truncate">{message.subject}</p>
        </div>
        <CategoryBadge category={message.category} />
      </div>

      <p className="text-parchment-dim text-xs mb-1">
        {message.sender} &middot; {formatTimestamp(message.timestamp)}
      </p>

      <p className={`text-parchment-dim text-sm ${expanded ? "" : "truncate"}`}>{message.body}</p>
    </button>
  );
}
