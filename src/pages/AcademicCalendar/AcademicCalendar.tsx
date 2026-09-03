import { useMemo, useState } from "react";
import { academicCalendar, calendarEventCategories } from "../../data/academicCalendar";
import type { CalendarEventCategory } from "../../types/resources";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function AcademicCalendarPage() {
  const [filter, setFilter] = useState<CalendarEventCategory | "All">("All");
  const todayIso = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    const sorted = [...academicCalendar].sort((a, b) => a.date.localeCompare(b.date));
    return filter === "All" ? sorted : sorted.filter((e) => e.category === filter);
  }, [filter]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🗓️ Academic Calendar</h1>
      <p className="text-parchment-dim text-sm mb-6">Term dates, holidays, exams, and deadlines for the year.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["All", ...calendarEventCategories] as const).map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
              filter === option
                ? "border-gold text-gold-bright bg-gold/10"
                : "border-parchment-dim/25 text-parchment-dim hover:border-gold/50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((event) => {
          const isPast = event.date < todayIso;
          return (
            <div
              key={event.id}
              className={`flex items-start justify-between gap-3 border rounded-sm px-5 py-4 ${
                isPast ? "border-parchment-dim/10 opacity-50" : "border-parchment-dim/20"
              }`}
            >
              <div className="min-w-0">
                <p className="font-display text-lg text-parchment">{event.title}</p>
                {event.description && (
                  <p className="text-parchment-dim text-sm mt-0.5">{event.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-parchment text-sm">{formatDate(event.date)}</p>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-parchment-dim/25 text-parchment-dim">
                  {event.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
