import type { SchedulesRepository } from "./interfaces/repositoryTypes";
import { getScheduleForYear } from "../data/schedules";

export const schedulesRepository: SchedulesRepository = {
  getForYear: async (year) => getScheduleForYear(year),
};

// Phase 5B transitional escape hatch - see coursesRepository.ts's own
// comment. Used by utils/academics.ts's getUpcomingSchedule.
export const schedulesRepositorySync = {
  getForYear: (year: number) => getScheduleForYear(year),
};
