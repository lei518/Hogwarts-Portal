import type { OfficeHour } from "../types/professorPortal";

// Phase 7A - Live Academic Data. professorProfiles/teachingCourses/
// studentRoster/professorAnnouncements are gone (see Part 1 - no seeded
// professor personas or fabricated rosters anywhere) - identity, teaching
// courses, roster, and announcements are now all resolved live by
// repositories/professorPortalRepository.ts. Office Hours is out of this
// phase's scope (not named in the task) and has no live backend yet, so it
// stays here, empty - OfficeHoursPage already renders "No office hours
// scheduled." for an empty list.
export const officeHours: OfficeHour[] = [];

export function getOfficeHoursForProfessor(professorId: string): OfficeHour[] {
  return officeHours.filter((hour) => hour.professorId === professorId);
}
