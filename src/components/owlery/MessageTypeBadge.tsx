import type { MessageType } from "../../services/supabase";

// Phase 5 - Owlery. Replaces the old OwlPostCategory badge - keyed by the
// real `messages.message_type` column instead of a local-only category.
export const MESSAGE_TYPE_COLORS: Record<MessageType, string> = {
  "Direct Message": "#c77b9e",
  Announcement: "#8b7fc7",
  "Assignment Notification": "#5b8fb9",
  "Grade Notification": "#c9a646",
  "Service Update": "#6b9e6b",
  Reminder: "#c9a646",
};

export function MessageTypeBadge({ type }: { type: MessageType }) {
  const color = MESSAGE_TYPE_COLORS[type];
  return (
    <span
      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
      style={{ color, borderColor: `${color}66`, background: `${color}15` }}
    >
      {type}
    </span>
  );
}
