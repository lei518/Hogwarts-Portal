import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { academicCalendar, calendarEventCategories } from "../../data/academicCalendar";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
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
      <PageHeader
        title="Academic Calendar"
        description="Term dates, holidays, exams, and deadlines for the year."
        icon={CalendarDays}
      />

      <div className="flex flex-wrap gap-2 my-6">
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
            <Card
              key={event.id}
              className={`flex items-start justify-between gap-3 px-5 py-4 ${isPast ? "opacity-50" : ""}`}
            >
              <div className="min-w-0">
                <p className="font-display text-lg text-parchment">{event.title}</p>
                {event.description && (
                  <p className="text-parchment-dim text-sm mt-0.5">{event.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-parchment text-sm mb-1">{formatDate(event.date)}</p>
                <Badge>{event.category}</Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
