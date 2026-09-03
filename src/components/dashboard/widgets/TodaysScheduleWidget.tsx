import { useGame } from "../../../context/GameContext";
import { getScheduleForYear } from "../../../data/schedules";
import { getCourse } from "../../../data/courses";
import type { DayOfWeek } from "../../../types/academics";
import { DashboardWidget } from "../DashboardWidget";

const WEEKDAY_BY_JS_DAY: Record<number, DayOfWeek | undefined> = {
  0: undefined, // Sunday
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: undefined, // Saturday
};

// Reads the same seeded timetable the Class Schedule page owns, filtered to
// today - no placeholder data once a year's schedule has been published.
export function TodaysScheduleWidget() {
  const { state } = useGame();
  const character = state.character;

  if (!character) return null;

  const today = WEEKDAY_BY_JS_DAY[new Date().getDay()];
  const todaysEntries = today
    ? getScheduleForYear(character.year)
        .filter((entry) => entry.day === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  return (
    <DashboardWidget title="Today's Schedule" to="/schedule" actionLabel="View Full Schedule">
      {!today ? (
        <p className="text-parchment-dim text-sm">No classes on weekends. Enjoy the castle.</p>
      ) : todaysEntries.length === 0 ? (
        <p className="text-parchment-dim text-sm">
          {getScheduleForYear(character.year).length === 0
            ? "Class schedules haven't been published yet. Check back once timetables are assigned."
            : "No classes scheduled for you today."}
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {todaysEntries.map((entry) => {
            const course = getCourse(entry.courseId);
            return (
              <p key={entry.id} className="text-parchment text-sm truncate">
                <span className="text-parchment-dim">{entry.startTime}</span> {course?.name ?? entry.courseId}
              </p>
            );
          })}
        </div>
      )}
    </DashboardWidget>
  );
}
