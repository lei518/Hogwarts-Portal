// Resources foundation - see CLAUDE.md's Resources section. Each interface
// is its own canonical entity, following the same pattern as Course/Location:
// other domains reference these by id rather than duplicating their fields.

export interface Professor {
  id: string; // stable, never derived from the display name
  name: string;
  title: string;
  officeLocation: string;
  officeHours: string;
  bio: string;
  researchInterests?: string[];
  // Not built yet - reserved sections on the detail page, see ProfessorDetail.tsx:
  // Owl Post Contact, Announcements by this Professor.
}

export type AnnouncementCategory = "Global" | "Academic" | "House";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  author: string;
  publishedAt: string; // ISO string
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
