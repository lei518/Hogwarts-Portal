import { useMemo, useState } from "react";
import { announcements, announcementCategories } from "../../data/announcements";
import type { AnnouncementCategory } from "../../types/resources";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

// Global/Academic/House are already distinguished in the data model today
// (see types/resources.ts) even though this page still shows them together
// by default - the filter row below is what that distinction unlocks
// without any future redesign.
export function AnnouncementsPage() {
  const [filter, setFilter] = useState<AnnouncementCategory | "All">("All");

  const filtered = useMemo(() => {
    const sorted = [...announcements].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return filter === "All" ? sorted : sorted.filter((a) => a.category === filter);
  }, [filter]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📣 School Announcements</h1>
      <p className="text-parchment-dim text-sm mb-6">Notices from around the castle.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["All", ...announcementCategories] as const).map((option) => (
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
        {filtered.map((announcement) => (
          <div key={announcement.id} className="border border-parchment-dim/20 rounded-sm px-5 py-4">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="font-display text-lg text-parchment">{announcement.title}</p>
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-parchment-dim/25 text-parchment-dim shrink-0">
                {announcement.category}
              </span>
            </div>
            <p className="text-parchment-dim text-xs mb-2">
              {announcement.author} &middot; {formatDate(announcement.publishedAt)}
            </p>
            <p className="text-parchment-dim text-sm">{announcement.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
