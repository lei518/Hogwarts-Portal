// Shared by any seeded data whose dates should stay meaningful relative to
// "today" rather than drift into the past (data/academicCalendar.ts,
// data/assignments.ts) - never hardcode a calendar date in seed data.
export function daysFromToday(offset: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}
