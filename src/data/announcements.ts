import type { Announcement, AnnouncementCategory } from "../types/resources";

export const announcementCategories: AnnouncementCategory[] = ["Global", "Academic", "House"];

// Real seeded posts, not placeholder text. Sorted newest first.
export const announcements: Announcement[] = [
  {
    id: "term-begins",
    title: "Term Begins",
    body: "Welcome back to Hogwarts School of Witchcraft and Wizardry. Classes begin promptly on Monday - please check your Class Schedule for your first lesson.",
    category: "Global",
    author: "Headmaster's Office",
    publishedAt: "2026-09-01T08:00:00.000Z",
  },
  {
    id: "flying-lessons-begin",
    title: "First-Year Flying Lessons Begin",
    body: "All first years will have their first Flying lesson with Madam Hooch this week. Meet at the Quidditch Pitch - brooms will be provided.",
    category: "Academic",
    author: "Madam Hooch",
    publishedAt: "2026-09-03T09:00:00.000Z",
  },
  {
    id: "library-restricted-section",
    title: "A Reminder About the Restricted Section",
    body: "Students are reminded that the Restricted Section of the Library requires signed professor permission. Unauthorized entry will result in a loss of house points.",
    category: "Academic",
    author: "Hogwarts Library",
    publishedAt: "2026-09-05T10:00:00.000Z",
  },
  {
    id: "quidditch-trial-signups",
    title: "House Quidditch Trial Sign-Ups Open",
    body: "Sign-up sheets for house Quidditch trials are now posted in each house common room. All positions are open except Seeker.",
    category: "House",
    author: "Quidditch Committee",
    publishedAt: "2026-09-08T14:00:00.000Z",
  },
  {
    id: "house-points-standings",
    title: "House Points Standings Now Visible",
    body: "The House Cup is live and updating throughout the term - check the House Cup page to see how your house is doing.",
    category: "House",
    author: "Headmaster's Office",
    publishedAt: "2026-09-10T12:00:00.000Z",
  },
];

export function getAnnouncement(id: string): Announcement | undefined {
  return announcements.find((a) => a.id === id);
}
