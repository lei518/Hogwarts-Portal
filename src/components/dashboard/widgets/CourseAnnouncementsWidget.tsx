import { useAcademicData } from "../../../context/AcademicDataContext";
import { DashboardWidget } from "../DashboardWidget";

// Phase 6 - Communication & Administration System. Shows only the single
// latest Course-scoped announcement - the Announcement Board (/announcements)
// owns the full list; this is a preview only, per CLAUDE.md's Home-previews
// rule. RLS already guarantees a student's `announcements` array can only
// ever contain Course rows for courses they're actually enrolled in, so no
// extra enrollment check is needed here.
export function CourseAnnouncementsWidget() {
  const { announcements, coursesById } = useAcademicData();
  const latest = [...announcements]
    .filter((a) => a.visibility === "Course")
    .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime())[0];
  const course = latest?.courseId ? coursesById.get(latest.courseId) : undefined;

  return (
    <DashboardWidget title="Course Announcements" to="/announcements" actionLabel="View All">
      {latest ? (
        <>
          <p className="text-parchment text-sm truncate">{latest.title}</p>
          <p className="text-parchment-dim text-xs">{course?.name ?? latest.author}</p>
        </>
      ) : (
        <p className="text-parchment-dim text-sm">No course announcements yet.</p>
      )}
    </DashboardWidget>
  );
}
