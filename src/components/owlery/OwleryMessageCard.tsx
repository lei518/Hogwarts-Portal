import { useState } from "react";
import { Reply } from "lucide-react";
import type { MessageRow } from "../../services/supabase";
import { MessageTypeBadge } from "./MessageTypeBadge";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface OwleryMessageCardProps {
  message: MessageRow;
  /** The other party's display name - sender for Inbox, receiver for Sent. */
  counterpartyName: string;
  counterpartyLabel: "From" | "To";
  onOpen?: (id: string) => void;
  /** Inbox messages only - opens Compose pre-filled to reply to the sender. */
  onReply?: (message: MessageRow) => void;
}

// The one place a message's read/unread + expand behavior lives - the
// Owlery page just renders a list of these, it doesn't own this logic.
export function OwleryMessageCard({ message, counterpartyName, counterpartyLabel, onOpen, onReply }: OwleryMessageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const unread = message.status === "Sent" && counterpartyLabel === "From";

  function handleClick() {
    setExpanded((e) => !e);
    if (unread) onOpen?.(message.id);
  }

  return (
    <div
      className={`w-full text-left border rounded-lg px-4 py-3 transition-all duration-150 ${
        unread ? "border-gold/40 bg-gold/5" : "border-parchment-dim/15 bg-surface"
      }`}
    >
      <button onClick={handleClick} className="w-full text-left">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {unread && <span className="w-1.5 h-1.5 rounded-full bg-gold-bright shrink-0" aria-label="Unread" />}
            <p className="font-display text-parchment truncate">{message.subject}</p>
          </div>
          <MessageTypeBadge type={message.messageType} />
        </div>

        <p className="text-parchment-dim text-xs mb-1">
          {counterpartyLabel}: {counterpartyName} &middot; {formatTimestamp(message.createdAt)}
        </p>

        <p className={`text-parchment-dim text-sm ${expanded ? "" : "truncate"}`}>{message.content}</p>
      </button>

      {expanded && onReply && counterpartyLabel === "From" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReply(message);
          }}
          className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright"
        >
          <Reply size={13} /> Reply
        </button>
      )}
    </div>
  );
}
