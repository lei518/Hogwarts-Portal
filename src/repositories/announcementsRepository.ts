import type { AnnouncementsRepository } from "./interfaces/repositoryTypes";
import { announcements, getAnnouncement } from "../data/announcements";

// No synchronous consumer (Announcements is read only by pages/widgets,
// untouched per "no page redesign") - purely async, no transitional escape
// hatch needed.
export const announcementsRepository: AnnouncementsRepository = {
  getAll: async () => announcements,
  getById: async (id) => getAnnouncement(id),
};
