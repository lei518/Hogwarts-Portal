import type { StudentService } from "../types/studentServices";

// Administrative services layer, not the catalog - the existing Library
// (data/books.ts, /library) remains the canonical book catalog and stays
// untouched by this module.
export const libraryServicesService: StudentService = {
  id: "library-services",
  name: "Library Services",
  category: "Academic Support",
  description:
    "Administrative services for library loans, reservations, and study spaces. To browse the book catalog itself, visit the Library.",
  location: { name: "Hogwarts Library", building: "Main Floor Service Desk" },
  hours: { display: "8:00 AM – 9:00 PM, Monday–Saturday" },
};

export interface BorrowedBook {
  id: string;
  title: string;
  borrowedOn: string;
  dueDate: string;
  status: "Borrowed" | "Overdue";
}

export const borrowedBooks: BorrowedBook[] = [
  { id: "loan-1", title: "Advanced Potion-Making", borrowedOn: "2026-08-20", dueDate: "2026-09-17", status: "Borrowed" },
  { id: "loan-2", title: "One Thousand Magical Herbs and Fungi", borrowedOn: "2026-08-10", dueDate: "2026-08-24", status: "Overdue" },
];

export interface ReservedBook {
  id: string;
  title: string;
  reservedOn: string;
}

export const reservedBooks: ReservedBook[] = [
  { id: "reserve-1", title: "Hogwarts: A History", reservedOn: "2026-09-01" },
];

export interface ReadingRoom {
  id: string;
  name: string;
  capacity: number;
  availability: "Open" | "Full" | "Reserved";
}

export const readingRooms: ReadingRoom[] = [
  { id: "room-1", name: "Main Reading Room", capacity: 40, availability: "Open" },
  { id: "room-2", name: "Quiet Study Room", capacity: 12, availability: "Open" },
  { id: "room-3", name: "Group Study Room A", capacity: 6, availability: "Reserved" },
];

const DUE_SOON_WINDOW_DAYS = 7;

// Phase 2 Integration Layer: the Student Planner and Owl Post both read this
// instead of filtering `borrowedBooks` themselves - Library Services stays
// the one place loan data lives, per CLAUDE.md's Student Services rules.
export function getUpcomingDueDates(): BorrowedBook[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  const dueSoonIso = new Date(Date.now() + DUE_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return borrowedBooks.filter(
    (book) => book.status === "Overdue" || (book.dueDate >= todayIso && book.dueDate <= dueSoonIso)
  );
}
