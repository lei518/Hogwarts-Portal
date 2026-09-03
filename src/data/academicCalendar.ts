import type { CalendarEvent, CalendarEventCategory } from "../types/resources";
import { daysFromToday } from "../utils/dates";

export const calendarEventCategories: CalendarEventCategory[] = [
  "Academic",
  "Holiday",
  "Examination",
  "Deadline",
  "School Event",
];

export const academicCalendar: CalendarEvent[] = [
  {
    id: "autumn-term-begins",
    title: "Autumn Term Begins",
    date: daysFromToday(-10),
    category: "Academic",
    description: "Classes resume for the new school year.",
  },
  {
    id: "herbology-essay-due",
    title: "Herbology Essay Due",
    date: daysFromToday(7),
    category: "Deadline",
    description: "First-year Herbology essay on magical fungi is due.",
  },
  {
    id: "halloween-feast",
    title: "Halloween Feast",
    date: daysFromToday(15),
    category: "School Event",
    description: "The annual feast in the Great Hall.",
  },
  {
    id: "quidditch-season-kickoff",
    title: "Quidditch Season Kickoff",
    date: daysFromToday(25),
    category: "School Event",
    description: "The house Quidditch season begins on the Quidditch Pitch.",
  },
  {
    id: "midyear-exams-begin",
    title: "Midyear Exams Begin",
    date: daysFromToday(45),
    category: "Examination",
    description: "In-class exams for all first-year courses.",
  },
  {
    id: "winter-holidays-begin",
    title: "Winter Holidays Begin",
    date: daysFromToday(70),
    category: "Holiday",
    description: "Students may stay at Hogwarts or travel home for the holidays.",
  },
  {
    id: "spring-term-begins",
    title: "Spring Term Begins",
    date: daysFromToday(100),
    category: "Academic",
    description: "Classes resume after the winter break.",
  },
];

export function getCalendarEvent(id: string): CalendarEvent | undefined {
  return academicCalendar.find((event) => event.id === id);
}
