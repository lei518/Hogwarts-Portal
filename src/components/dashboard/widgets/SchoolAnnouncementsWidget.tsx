import { useAcademicData } from "../../../context/AcademicDataContext";
import { DashboardWidget } from "../DashboardWidget";

// Shows only the single latest School-wide announcement - the Announcement
// Board (/announcements) owns the full list; this is a preview only, per
// CLAUDE.md's Home-previews rule.
// Phase 6 - reads the live `announcements` table (RLS-scoped: published,
// non-expired) via AcademicDataContext, explicitly filtered to
// visibility === "School" so a Course announcement never sorts in here.
export function SchoolAnnouncementsWidget() {
  const { announcements } = useAcademicData();
  const latest = [...announcements]
    .filter((a) => a.visibility === "School")
    .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime())[0];

  return (
    <DashboardWidget title="School Announcements" to="/announcements" actionLabel="View All">
      {latest ? (
        <>
          <p className="text-parchment text-sm truncate">{latest.title}</p>
          <p className="text-parchment-dim text-xs">{latest.author}</p>
        </>
      ) : (
        <p className="text-parchment-dim text-sm">No announcements available.</p>
      )}
    </DashboardWidget>
  );
}
