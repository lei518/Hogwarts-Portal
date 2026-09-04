import { FileEdit, BarChart3 } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

// Canonical owner of this professor's own announcements - independent from
// Resources' School Announcements (data/announcements.ts), which stays the
// school-wide channel. See CLAUDE.md's Professor Portal section.
//
// Authentication Foundation (Phase 6B): announcements/teachingCoursesById
// come from useProfessorScope(), already filtered to the signed-in
// professor's own posts.
export function ProfessorAnnouncementsPage() {
  const { announcements: scopedAnnouncements, teachingCoursesById, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading your announcements…" />
      </div>
    );
  }

  const announcements = [...scopedAnnouncements].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📣 Announcements</h1>
        <p className="text-parchment-dim text-sm">Notices you've posted to your students.</p>
      </div>

      {announcements.length === 0 ? (
        <p className="text-parchment-dim text-sm border border-parchment-dim/15 rounded-sm px-5 py-8 text-center">
          No announcements.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {announcements.map((announcement) => {
            const teachingCourse = announcement.teachingCourseId
              ? teachingCoursesById.get(announcement.teachingCourseId)
              : undefined;
            return (
              <div key={announcement.id} className="border border-parchment-dim/20 rounded-sm px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="font-display text-lg text-parchment">{announcement.title}</p>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-parchment-dim/25 text-parchment-dim shrink-0">
                    {teachingCourse ? teachingCourse.section : announcement.audience}
                  </span>
                </div>
                <p className="text-parchment-dim text-xs mb-2">{formatDate(announcement.postedAt)}</p>
                <p className="text-parchment-dim text-sm">{announcement.body}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Draft Announcements" icon={FileEdit}>
          <p className="text-parchment-dim text-sm">
            Unpublished drafts will be saved here once announcement authoring is available.
          </p>
        </ProfileSection>

        <ProfileSection title="Announcement Analytics" icon={BarChart3}>
          <p className="text-parchment-dim text-sm">
            Read rates and engagement per announcement will appear here once that data is tracked.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
