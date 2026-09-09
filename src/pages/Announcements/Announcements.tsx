import { useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { announcementTypes } from "../../data/announcements";
import { useAcademicData } from "../../context/AcademicDataContext";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { AnnouncementTypeBadge } from "../../components/announcements/AnnouncementTypeBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import type { AnnouncementType } from "../../types/resources";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

// Phase 6 - Communication & Administration System. Reads the live
// `announcements` table via AcademicDataContext - RLS already scopes what
// comes back to exactly what this student is allowed to see (published,
// non-expired, School-wide or their own enrolled-course announcements), so
// no client-side visibility filtering happens here, only the type filter.
export function AnnouncementsPage() {
  const { announcements, coursesById, loading } = useAcademicData();
  const [filter, setFilter] = useState<AnnouncementType | "All">("All");

  const filtered = useMemo(() => {
    const sorted = [...announcements].sort(
      (a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime()
    );
    return filter === "All" ? sorted : sorted.filter((a) => a.announcementType === filter);
  }, [announcements, filter]);

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading announcements…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
      <PageHeader
        title="Announcement Board"
        description="Notices from around the castle."
        icon={Megaphone}
      />

      <div className="flex flex-wrap gap-2 my-6">
        {(["All", ...announcementTypes] as const).map((option) => (
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

      {filtered.length === 0 ? (
        <EmptyState message="No announcements available." icon={Megaphone} />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((announcement) => {
            const course = announcement.courseId ? coursesById.get(announcement.courseId) : undefined;
            return (
              <Card key={announcement.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="font-display text-lg text-parchment">{announcement.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    {course && <Badge tone="sapphire">{course.name}</Badge>}
                    <AnnouncementTypeBadge type={announcement.announcementType} />
                  </div>
                </div>
                <p className="text-parchment-dim text-xs mb-2">
                  {announcement.author} &middot; {formatDate(announcement.publishedAt ?? announcement.createdAt)}
                </p>
                <p className="text-parchment-dim text-sm">{announcement.content}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
