// Owl Post is the portal's official communication system (see CLAUDE.md) -
// every future feature (Academics, House Cup, Student Planner, Announcements,
// ...) publishes into this same shape via GameContext's SEND_OWL_POST_MESSAGE
// action rather than inventing its own notification model.
export type OwlPostCategory = "Admissions" | "Professors" | "School" | "House" | "Personal";

export interface OwlPostMessage {
  id: string;
  category: OwlPostCategory;
  sender: string;
  subject: string;
  body: string;
  timestamp: string; // ISO string
  read: boolean;
}
