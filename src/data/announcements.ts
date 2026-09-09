import type { AnnouncementType } from "../types/resources";

// Phase 6 - Communication & Administration System. The old
// AnnouncementCategory ("Global"/"Academic"/"House") is gone, replaced by
// a real 5-value taxonomy - see types/resources.ts's Announcement.
export const announcementTypes: AnnouncementType[] = [
  "General",
  "Academic",
  "Campus Event",
  "Emergency",
  "Maintenance",
];
