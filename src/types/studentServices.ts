// Student Services module - see CLAUDE.md's Student Services section. This
// is a standalone module: the four shared shapes below are reused across
// all six service pages so their "what/where/when" masthead is consistent,
// but each page's specific content (RecoveryRoom, RegisteredOwl,
// BorrowedBook, ...) is its own independent interface in its own data file
// - nothing is nested into one giant object, and no page reads another
// page's data.
export type ServiceCategory =
  | "Medical"
  | "Communication"
  | "Academic Support"
  | "Campus Access"
  | "Lost & Found"
  | "Advising";

export interface ServiceLocation {
  name: string;
  building?: string;
}

export interface ServiceHours {
  display: string; // human-readable, e.g. "24 hours" or "Mon-Fri, 9 AM - 5 PM"
}

// The common "directory entry" shape every service page's masthead uses.
export interface StudentService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  location: ServiceLocation;
  hours: ServiceHours;
}
