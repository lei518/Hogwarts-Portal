import { announcements } from "../../../data/announcements";
import { DashboardWidget } from "../DashboardWidget";

// Shows only the single latest announcement - School Announcements
// (/announcements) owns the full list and its Global/Academic/House
// categories; this is a preview only, per CLAUDE.md's Home-previews rule.
export function SchoolAnnouncementsWidget() {
  const latest = [...announcements].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )[0];

  return (
    <DashboardWidget title="School Announcements" to="/announcements" actionLabel="View All">
      {latest ? (
        <>
          <p className="text-parchment text-sm truncate">{latest.title}</p>
          <p className="text-parchment-dim text-xs">{latest.author}</p>
        </>
      ) : (
        <p className="text-parchment-dim text-sm">
          📜 There are no announcements from the school at this time.
        </p>
      )}
    </DashboardWidget>
  );
}
