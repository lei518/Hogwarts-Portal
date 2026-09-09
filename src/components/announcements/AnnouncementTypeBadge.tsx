import type { AnnouncementType } from "../../types/resources";
import { Badge, type BadgeTone } from "../ui/Badge";

// Phase 6 - Communication & Administration System. Shared across the
// Student/Professor/Admin announcement lists so the same type reads the
// same color everywhere.
const ANNOUNCEMENT_TYPE_TONES: Record<AnnouncementType, BadgeTone> = {
  General: "neutral",
  Academic: "sapphire",
  "Campus Event": "gold",
  Emergency: "maroon",
  Maintenance: "emerald",
};

export function AnnouncementTypeBadge({ type, className }: { type: AnnouncementType; className?: string }) {
  return (
    <Badge tone={ANNOUNCEMENT_TYPE_TONES[type]} className={className}>
      {type}
    </Badge>
  );
}
