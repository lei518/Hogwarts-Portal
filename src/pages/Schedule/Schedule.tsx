import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { getScheduleForYear } from "../../data/schedules";
import { getCourse } from "../../data/courses";
import type { DayOfWeek } from "../../types/academics";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function SchedulePage() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const entries = getScheduleForYear(character.year);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto flex flex-col gap-8">
      <PageHeader
        title="Class Schedule"
        description={`Your weekly timetable for Year ${character.year}.`}
        icon={CalendarDays}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          message={`The Year ${character.year} timetable hasn't been published yet. Check back once it's assigned.`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DAYS.map((day) => {
            const dayEntries = entries
              .filter((e) => e.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            return (
              <Card key={day} className="px-4 py-4">
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
