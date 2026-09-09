import type { AnnouncementsRepository, CreateAnnouncementRepoInput } from "./interfaces/repositoryTypes";
import type { Announcement } from "../types/resources";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  listDirectoryProfiles,
  updateAnnouncement,
  type AnnouncementRow,
} from "../services/supabase";

// Phase 6 - Communication & Administration System. Real CRUD over the live
// `announcements` table, replacing the old read-only path. `author` is
// resolved to the real signed-in admin/professor's display name at read
// time - never a fabricated office name (unchanged from Phase 7A).
async function resolveAuthorNames(rows: AnnouncementRow[]): Promise<Map<string, string>> {
  const authorIds = [...new Set(rows.map((row) => row.authorUserId).filter((id): id is string => id !== null))];
  const authorsById = new Map<string, string>();
  if (authorIds.length > 0) {
    const [professors, admins] = await Promise.all([
      listDirectoryProfiles("professor"),
      listDirectoryProfiles("admin"),
    ]);
    for (const account of [...professors, ...admins]) authorsById.set(account.userId, account.displayName);
  }
  return authorsById;
}

function toAnnouncement(row: AnnouncementRow, authorsById: Map<string, string>): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    announcementType: row.announcementType,
    visibility: row.visibility,
    courseId: row.courseId,
    authorUserId: row.authorUserId,
    author: (row.authorUserId && authorsById.get(row.authorUserId)) || "Hogwarts Administration",
    published: row.published,
    publishedAt: row.publishedAt,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

async function toAnnouncements(): Promise<Announcement[]> {
  const rows = await listAnnouncements();
  const authorsById = await resolveAuthorNames(rows);
  return rows.map((row) => toAnnouncement(row, authorsById));
}

export const announcementsRepository: AnnouncementsRepository = {
  getAll: async () => toAnnouncements(),
  getById: async (id) => (await toAnnouncements()).find((announcement) => announcement.id === id),

  create: async (input: CreateAnnouncementRepoInput) => {
    const row = await createAnnouncement(input);
    const authorsById = await resolveAuthorNames([row]);
    return toAnnouncement(row, authorsById);
  },

  update: async (id, updates) => {
    const row = await updateAnnouncement(id, updates);
    const authorsById = await resolveAuthorNames([row]);
    return toAnnouncement(row, authorsById);
  },

  remove: (id) => deleteAnnouncement(id),

  publish: async (id) => {
    const row = await updateAnnouncement(id, { published: true, publishedAt: new Date().toISOString() });
    const authorsById = await resolveAuthorNames([row]);
    return toAnnouncement(row, authorsById);
  },

  // Leaves publishedAt as-is - an honest "last time this went live" record,
  // not cleared just because it's currently hidden again.
  unpublish: async (id) => {
    const row = await updateAnnouncement(id, { published: false });
    const authorsById = await resolveAuthorNames([row]);
    return toAnnouncement(row, authorsById);
  },
};
