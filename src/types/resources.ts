// Resources foundation - see CLAUDE.md's Resources section. Each interface
// is its own canonical entity, following the same pattern as Course/Location:
// other domains reference these by id rather than duplicating their fields.

// Phase 7A - `id` is now a real Supabase user id (see
// repositories/professorsRepository.ts). Everything past name/title is
// optional and unpopulated for a real account - no seeded flavor text is
// fabricated on their behalf; ProfessorDetail.tsx shows a reserved
// "not yet provided" section instead.
export interface Professor {
  id: string; // stable, never derived from the display name
  name: string;
  title: string;
  officeLocation?: string;
  officeHours?: string;
  bio?: string;
  researchInterests?: string[];
  // Not built yet - reserved sections on the detail page, see ProfessorDetail.tsx:
  // Owl Post Contact, Announcements by this Professor.
}

// Phase 6 - Communication & Administration System. Replaces the old
// seeded-flavored Global/Academic/House category with a real authored/
// published/expiring broadcast system, school-wide or course-scoped - see
// supabase/migrations/0007_announcements_and_service_assignments.sql.
export type AnnouncementType = "General" | "Academic" | "Campus Event" | "Emergency" | "Maintenance";
export type AnnouncementVisibility = "School" | "Course";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  announcementType: AnnouncementType;
  visibility: AnnouncementVisibility;
  courseId: string | null;
  authorUserId: string | null;
  author: string;
  published: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export type PolicyCategory = "Conduct" | "Safety" | "Academic" | "Access";

export interface Policy {
  id: string;
  title: string;
  category: PolicyCategory;
  summary: string;
  body: string;
}

export type CalendarEventCategory = "Academic" | "Holiday" | "Examination" | "Deadline" | "School Event";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO "YYYY-MM-DD"
  category: CalendarEventCategory;
  description?: string;
}
