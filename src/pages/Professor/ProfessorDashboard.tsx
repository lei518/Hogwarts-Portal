import { BookMarked, Users, Clock, Megaphone, ClipboardCheck, Mail } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { DashboardWidget } from "../../components/dashboard/DashboardWidget";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

// The Professor Portal homepage: summaries only, same "widgets, owns no data
// of its own" rule as the Student Dashboard - see CLAUDE.md's Professor
// Portal section. Reuses DashboardWidget, the same generic card shell the
// Student Dashboard renders through, rather than a second card component.
//
// Authentication Foundation (Phase 6B): every number here belongs to the
// signed-in professor, via useProfessorScope() - this page no longer
// assumes Professor Snape.
export function ProfessorDashboardPage() {
  const { profile, teachingCourses, rosterByTeachingCourseId, officeHours, announcements, loading } =
    useProfessorScope();

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto">
        <LoadingState label="Loading your dashboard…" />
      </div>
    );
  }

  const rosterCount = teachingCourses.reduce(
    (sum, course) => sum + (rosterByTeachingCourseId.get(course.id)?.length ?? 0),
    0
  );
  const [nextOfficeHour] = officeHours;
  const [latestAnnouncement] = [...announcements].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );
  const courseCount = new Set(teachingCourses.map((course) => course.courseId)).size;

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-1">
          Welcome back, {profile?.displayName ?? "Professor"}
        </h1>
        <p className="text-parchment-dim text-sm">{profile?.title ?? "Hogwarts Faculty"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardWidget title="My Courses" icon={BookMarked} to="/professor/courses" actionLabel="View Courses">
          <p className="text-parchment text-2xl font-display mb-1">{teachingCourses.length}</p>
          <p className="text-parchment-dim text-xs">
            section{teachingCourses.length === 1 ? "" : "s"} across {courseCount} course
            {courseCount === 1 ? "" : "s"}
          </p>
        </DashboardWidget>

        <DashboardWidget title="Student Roster" icon={Users} to="/professor/roster" actionLabel="View Roster">
          <p className="text-parchment text-2xl font-display mb-1">{rosterCount}</p>
          <p className="text-parchment-dim text-xs">students enrolled across your sections</p>
        </DashboardWidget>

        <DashboardWidget title="Next Office Hour" icon={Clock} to="/professor/office-hours" actionLabel="View Schedule">
          {nextOfficeHour ? (
            <>
              <p className="text-parchment text-sm mb-1">
                {nextOfficeHour.day}, {nextOfficeHour.startTime} – {nextOfficeHour.endTime}
              </p>
              <p className="text-parchment-dim text-xs">{nextOfficeHour.location}</p>
            </>
          ) : (
            <p className="text-parchment-dim text-sm">No office hours scheduled.</p>
          )}
        </DashboardWidget>

        <DashboardWidget title="Latest Announcement" icon={Megaphone} to="/professor/announcements" actionLabel="View All">
          {latestAnnouncement ? (
            <>
              <p className="text-parchment text-sm mb-1 truncate">{latestAnnouncement.title}</p>
              <p className="text-parchment-dim text-xs">{formatDate(latestAnnouncement.postedAt)}</p>
            </>
          ) : (
            <p className="text-parchment-dim text-sm">No announcements posted yet.</p>
          )}
        </DashboardWidget>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Upcoming Grade Reviews" icon={ClipboardCheck}>
          <p className="text-parchment-dim text-sm">
            Grades awaiting your review will appear here once Grade Management is available in a future
            milestone.
          </p>
        </ProfileSection>

        <ProfileSection title="Recent Owl Post" icon={Mail}>
          <p className="text-parchment-dim text-sm">
            Correspondence from your students will appear here once Owl Post integration is available for the
            Professor Portal.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
