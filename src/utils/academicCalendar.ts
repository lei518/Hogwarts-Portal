import { academicCalendar } from "../data/academicCalendar";
import type { CalendarEvent } from "../types/resources";

// The Planner and Home's Announcements-adjacent widgets read this instead
// of holding their own copy of "what's coming up" - Academic Calendar stays
// the one place event dates live.
export function getUpcomingCalendarEvents(count: number): CalendarEvent[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  return [...academicCalendar]
    .filter((event) => event.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}
