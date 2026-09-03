import { Link } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import { getScheduleForYear } from "../../data/schedules";
import { getCourse } from "../../data/courses";
import type { DayOfWeek } from "../../types/academics";

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function SchedulePage() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const entries = getScheduleForYear(character.year);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🗓️ Class Schedule</h1>
      <p className="text-parchment-dim text-sm mb-8">Your weekly timetable for Year {character.year}.</p>

      {entries.length === 0 ? (
        <p className="text-parchment-dim text-sm border border-parchment-dim/15 rounded-sm px-5 py-8 text-center">
          The Year {character.year} timetable hasn't been published yet. Check back once it's assigned.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {DAYS.map((day) => {
            const dayEntries = entries
              .filter((e) => e.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            return (
              <div key={day} className="border border-parchment-dim/20 rounded-sm px-4 py-3">
                <p className="text-parchment-dim text-xs uppercase tracking-[0.2em] mb-3">{day}</p>
                {dayEntries.length === 0 ? (
                  <p className="text-parchment-dim text-xs">No classes</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {dayEntries.map((entry) => {
                      const course = getCourse(entry.courseId);
                      return (
                        <Link
                          key={entry.id}
                          to={`/courses/${entry.courseId}`}
                          className="block hover:text-gold-bright transition-colors"
                        >
                          <p className="text-parchment-dim text-[11px]">
                            {entry.startTime} &ndash; {entry.endTime}
                          </p>
                          <p className="font-display text-parchment text-sm">
                            {course?.name ?? entry.courseId}
                          </p>
                          {course && (
                            <p className="text-parchment-dim text-[11px]">{course.classroom}</p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
