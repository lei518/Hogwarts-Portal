import type { CalendarRepository } from "./interfaces/repositoryTypes";
import { academicCalendar, getCalendarEvent } from "../data/academicCalendar";

export const calendarRepository: CalendarRepository = {
  getAll: async () => academicCalendar,
  getById: async (id) => getCalendarEvent(id),
};

// Phase 5B transitional escape hatch - see coursesRepository.ts's own
// comment. Used by utils/grades.ts (getCurrentSemester) and
// utils/academicCalendar.ts (getUpcomingCalendarEvents).
export const calendarRepositorySync = {
  getAll: () => academicCalendar,
  getById: (id: string) => getCalendarEvent(id),
};
