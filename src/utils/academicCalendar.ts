// Phase 5B: called synchronously from several page render bodies (the
// Student Planner, Dashboard) - see repositories/calendarRepository.ts's
// comment on its transitional sync accessor.
import { calendarRepositorySync } from "../repositories/calendarRepository";
import type { CalendarEvent } from "../types/resources";

// The Planner and Home's Announcements-adjacent widgets read this instead
// of holding their own copy of "what's coming up" - Academic Calendar stays
// the one place event dates live.
export function getUpcomingCalendarEvents(count: number): CalendarEvent[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  return calendarRepositorySync
    .getAll()
    .filter((event) => event.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}
