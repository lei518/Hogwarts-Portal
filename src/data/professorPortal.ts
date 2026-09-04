import type {
  OfficeHour,
  ProfessorAnnouncement,
  ProfessorProfile,
  StudentRosterEntry,
  TeachingCourse,
} from "../types/professorPortal";

// Professor Portal Foundation - standalone module, seeded data only (see
// CLAUDE.md's Professor Portal section). `professorProfiles` models
// Professor Snape, already seeded in data/professors.ts (id "snape"), as
// the one professor persona on file today - `id` deliberately matches that
// existing Professor.id rather than duplicating a new one.
//
// Authentication Foundation (Phase 6B): this is now an array, searchable by
// display name, instead of a single object - see
// getProfessorProfileByDisplayName below, the seam
// AuthenticatedProfessorContext resolves the signed-in professor through.
// Every TeachingCourse/OfficeHour/ProfessorAnnouncement now carries the
// `professorId` it always implicitly belonged to.
export const professorProfiles: ProfessorProfile[] = [
  {
    id: "snape",
    displayName: "Professor Severus Snape",
    title: "Potions Professor · Head of Slytherin House",
    department: "Potions",
    officeLocation: "Potions Classroom, Dungeons",
    bio: "Exacting and famously sparing with praise. Twenty years teaching Potions at Hogwarts, and not an explosion he didn't see coming first.",
    yearsAtHogwarts: 20,
  },
];

// Two sections of the same base course (data/courses.ts's "potions") -
// TeachingCourse models what a professor actually teaches, which is finer-
// grained than the single canonical Course record Resources owns.
export const teachingCourses: TeachingCourse[] = [
  {
    id: "potions-y1-a",
    professorId: "snape",
    courseId: "potions",
    section: "Year 1 · Section A",
    meetingPattern: "Mon/Wed/Fri, 9:00 AM – 10:30 AM",
    enrolledStudentIds: ["harry-potter", "hermione-granger", "neville-longbottom", "draco-malfoy"],
  },
  {
    id: "potions-y1-b",
    professorId: "snape",
    courseId: "potions",
    section: "Year 1 · Section B",
    meetingPattern: "Tue/Thu, 1:00 PM – 2:30 PM",
    enrolledStudentIds: ["ron-weasley", "seamus-finnigan", "blaise-zabini"],
  },
];

// Display data only - not linked to a live Student record (data/students.ts
// models these same names at their current in-game year, not their first
// year in Snape's classroom), consistent with Student Services' own
// "seeded independently" precedent for content that overlaps another module.
export const studentRoster: StudentRosterEntry[] = [
  {
    id: "roster-harry-potter",
    studentName: "Harry Potter",
    house: "Gryffindor",
    year: 1,
    teachingCourseId: "potions-y1-a",
    standing: "Needs Attention",
    attendanceNote: "Ingredient prep still rushed - remind him precision matters more than speed.",
  },
  {
    id: "roster-hermione-granger",
    studentName: "Hermione Granger",
    house: "Gryffindor",
    year: 1,
    teachingCourseId: "potions-y1-a",
    standing: "Excelling",
    attendanceNote: "Finishes early and asks questions past the syllabus.",
  },
  {
    id: "roster-neville-longbottom",
    studentName: "Neville Longbottom",
    house: "Gryffindor",
    year: 1,
    teachingCourseId: "potions-y1-a",
    standing: "Needs Attention",
    attendanceNote: "Nervous around the cauldron. Pair with a calmer partner next term.",
  },
  {
    id: "roster-draco-malfoy",
    studentName: "Draco Malfoy",
    house: "Slytherin",
    year: 1,
    teachingCourseId: "potions-y1-a",
    standing: "On Track",
  },
  {
    id: "roster-ron-weasley",
    studentName: "Ron Weasley",
    house: "Gryffindor",
    year: 1,
    teachingCourseId: "potions-y1-b",
    standing: "On Track",
  },
  {
    id: "roster-seamus-finnigan",
    studentName: "Seamus Finnigan",
    house: "Gryffindor",
    year: 1,
    teachingCourseId: "potions-y1-b",
    standing: "Needs Attention",
    attendanceNote: "Third minor cauldron incident this term. Seat away from open flame.",
  },
  {
    id: "roster-blaise-zabini",
    studentName: "Blaise Zabini",
    house: "Slytherin",
    year: 1,
    teachingCourseId: "potions-y1-b",
    standing: "Excelling",
  },
];

export const officeHours: OfficeHour[] = [
  {
    id: "office-hour-monday",
    professorId: "snape",
    day: "Monday",
    startTime: "18:00",
    endTime: "19:00",
    location: "Potions Classroom, Dungeons",
    note: "Drop-ins welcome, but latecomers may find the door locked.",
  },
  {
    id: "office-hour-thursday",
    professorId: "snape",
    day: "Thursday",
    startTime: "16:00",
    endTime: "17:00",
    location: "Potions Classroom, Dungeons",
    note: "By appointment only during exam weeks.",
  },
];

export const professorAnnouncements: ProfessorAnnouncement[] = [
  {
    id: "announcement-cauldron-safety",
    professorId: "snape",
    title: "Cauldron Safety Reminder",
    body: "Several cauldrons were left unattended over heat last week. Anyone found doing so again will be brewing alone, without a partner, for the rest of term.",
    audience: "All My Students",
    postedAt: "2026-09-01",
  },
  {
    id: "announcement-section-b-extension",
    professorId: "snape",
    title: "Essay Extension for Section B",
    body: "Given Tuesday's schedule change, the Wiggenweld Potion essay is now due Thursday instead of Wednesday. Do not mistake this for leniency in general.",
    audience: "Specific Course",
    teachingCourseId: "potions-y1-b",
    postedAt: "2026-08-28",
  },
  {
    id: "announcement-section-a-ingredients",
    professorId: "snape",
    title: "Ingredient List for Next Week",
    body: "Bring your own supply of horned slugs to Friday's lesson. The classroom store will not be shared.",
    audience: "Specific Course",
    teachingCourseId: "potions-y1-a",
    postedAt: "2026-08-25",
  },
];

// Kept for bridges/assignmentBridge.ts and bridges/GradeBridgeSync.tsx (via
// professorPortalRepository.getProfile()) - those reflect DATA ownership
// (which professor a piece of seeded course/assignment data belongs to),
// not the current Portal session's identity, so they deliberately keep
// resolving to this same reference persona regardless of who's
// authenticated. See professorPortalRepository.ts's own comment.
export function getProfessorProfile(): ProfessorProfile {
  return professorProfiles[0];
}

// Authentication Foundation (Phase 6B) - the seam
// AuthenticatedProfessorContext resolves the signed-in professor through:
// match the Supabase profile's display name against the one (or, in a
// future term, several) seeded professor personas. No match is a normal,
// expected outcome, not an error - see that context's own comment.
export function getProfessorProfileByDisplayName(displayName: string): ProfessorProfile | undefined {
  return professorProfiles.find((profile) => profile.displayName === displayName);
}

export function getTeachingCourse(id: string): TeachingCourse | undefined {
  return teachingCourses.find((course) => course.id === id);
}

export function getTeachingCoursesForProfessor(professorId: string): TeachingCourse[] {
  return teachingCourses.filter((course) => course.professorId === professorId);
}

export function getRosterForCourse(teachingCourseId: string): StudentRosterEntry[] {
  return studentRoster.filter((entry) => entry.teachingCourseId === teachingCourseId);
}

export function getOfficeHoursForProfessor(professorId: string): OfficeHour[] {
  return officeHours.filter((hour) => hour.professorId === professorId);
}

export function getAnnouncementsForProfessor(professorId: string): ProfessorAnnouncement[] {
  return professorAnnouncements.filter((announcement) => announcement.professorId === professorId);
}
