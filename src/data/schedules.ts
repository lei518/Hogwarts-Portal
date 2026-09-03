import type { ScheduleEntry } from "../types/academics";

// Keyed by year so a future Year 2+ timetable is just another entry here,
// not a redesign. Only Year 1 is seeded today; getScheduleForYear returns an
// empty list for anything else, and callers treat that as "not published yet".
const schedulesByYear: Record<number, ScheduleEntry[]> = {
  1: [
    { id: "y1-mon-charms", courseId: "charms", day: "Monday", startTime: "09:00", endTime: "10:30" },
    { id: "y1-mon-herbology", courseId: "herbology", day: "Monday", startTime: "11:00", endTime: "12:30" },
    { id: "y1-tue-dada", courseId: "defence-against-the-dark-arts", day: "Tuesday", startTime: "09:00", endTime: "10:30" },
    { id: "y1-tue-potions", courseId: "potions", day: "Tuesday", startTime: "13:00", endTime: "14:30" },
    { id: "y1-wed-history", courseId: "history-of-magic", day: "Wednesday", startTime: "10:00", endTime: "11:30" },
    { id: "y1-wed-astronomy", courseId: "astronomy", day: "Wednesday", startTime: "23:00", endTime: "00:00" },
    { id: "y1-thu-flying", courseId: "flying", day: "Thursday", startTime: "09:00", endTime: "10:30" },
    { id: "y1-thu-charms", courseId: "charms", day: "Thursday", startTime: "11:00", endTime: "12:30" },
    { id: "y1-fri-potions", courseId: "potions", day: "Friday", startTime: "09:00", endTime: "10:30" },
    { id: "y1-fri-herbology", courseId: "herbology", day: "Friday", startTime: "11:00", endTime: "12:30" },
  ],
};

export function getScheduleForYear(year: number): ScheduleEntry[] {
  return schedulesByYear[year] ?? [];
}
