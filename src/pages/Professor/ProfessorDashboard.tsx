import { BookMarked, Users, Clock, Megaphone, ClipboardCheck, CalendarClock } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { useAcademicData } from "../../context/AcademicDataContext";
import { getScheduleForYear } from "../../data/schedules";
import { getCourse } from "../../data/courses";
import { DashboardWidget } from "../../components/dashboard/DashboardWidget";
import { LoadingState } from "../../components/ui/LoadingState";
import type { DayOfWeek } from "../../types/academics";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

const WEEK: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function todaysDay(): DayOfWeek | null {
  const jsDay = new Date().getDay(); // 0 Sun - 6 Sat
  return jsDay === 0 || jsDay === 6 ? null : WEEK[jsDay - 1];
}

// The Professor Portal homepage: summaries only, same "widgets, owns no data
// of its own" rule as the Student Dashboard - see CLAUDE.md's Professor
// Portal section. Reuses DashboardWidget, the same generic card shell the
// Student Dashboard renders through, rather than a second card component.
//
// Phase 7A - every number here now comes from a real signed-in professor's
// live course_professor_assignments (see useProfessorScope(), in turn
// AuthenticatedProfessorContext/professorPortalRepository) - a professor
// with no assigned courses sees an honest "You have not yet been assigned
// any courses." instead of Professor Snape's seeded roster.
export function ProfessorDashboardPage() {
  const { professorId, profile, teachingCourses, submissions, loading } = useProfessorScope();
  const { announcements, loading: announcementsLoading } = useAcademicData();

  if (loading || announcementsLoading) {
    return (
      <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto">
        <LoadingState label="Loading your dashboard…" />
      </div>
    );
  }

  const enrolledStudentIds = new Set(teachingCourses.flatMap((course) => course.enrolledStudentIds));
  const [latestCourseAnnouncement] = [...announcements]
    .filter((a) => a.authorUserId === professorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [latestSchoolAnnouncement] = [...announcements]
    .filter((a) => a.visibility === "School")
    .sort(
      (a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime()
    );
  const pendingCount = submissions.filter((submission) => submission.status !== "Graded").length;

  const today = todaysDay();
  const todaysClasses = today
    ? teachingCourses.flatMap((teachingCourse) => {
        const course = getCourse(teachingCourse.courseId);
        if (!course) return [];
        return getScheduleForYear(course.requiredYear)
          .filter((entry) => entry.courseId === teachingCourse.courseId && entry.day === today)
          .map((entry) => ({ course, entry }));
      })
    : [];

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-1">
          Welcome back, {profile?.displayName ?? "Professor"}
        </h1>
        <p className="text-parchment-dim text-sm">{profile?.title ?? "Hogwarts Faculty"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardWidget title="Classes Currently Teaching" icon={BookMarked} to="/professor/courses" actionLabel="View Courses">
          {teachingCourses.length === 0 ? (
            <p className="text-parchment-dim text-sm">You have not yet been assigned any courses.</p>
          ) : (
            <p className="text-parchment text-2xl font-display">{teachingCourses.length}</p>
          )}
        </DashboardWidget>

        <DashboardWidget title="Students Enrolled" icon={Users} to="/professor/roster" actionLabel="View Roster">
          {enrolledStudentIds.size === 0 ? (
            <p className="text-parchment-dim text-sm">No students enrolled.</p>
          ) : (
            <p className="text-parchment text-2xl font-display">{enrolledStudentIds.size}</p>
          )}
        </DashboardWidget>

        <DashboardWidget title="Today's Schedule" icon={Clock}>
          {todaysClasses.length === 0 ? (
            <p className="text-parchment-dim text-sm">Nothing scheduled today.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {todaysClasses.map(({ course, entry }) => (
                <p key={entry.id} className="text-sm truncate">
                  <span className="text-parchment-dim">{entry.startTime}</span>{" "}
                  <span className="text-parchment">{course.name}</span>
                </p>
              ))}
            </div>
          )}
        </DashboardWidget>

        <DashboardWidget title="Pending Grading" icon={ClipboardCheck}>
          {pendingCount === 0 ? (
            <p className="text-parchment-dim text-sm">No submissions to review yet.</p>
          ) : (
            <p className="text-parchment text-2xl font-display">{pendingCount}</p>
          )}
        </DashboardWidget>

        <DashboardWidget title="Recent Course Announcements" icon={Megaphone} to="/professor/announcements" actionLabel="View All">
          {latestCourseAnnouncement ? (
            <>
              <p className="text-parchment text-sm mb-1 truncate">{latestCourseAnnouncement.title}</p>
              <p className="text-parchment-dim text-xs">{formatDate(latestCourseAnnouncement.createdAt)}</p>
            </>
          ) : (
            <p className="text-parchment-dim text-sm">No announcements yet.</p>
          )}
        </DashboardWidget>

        <DashboardWidget title="School Announcements" icon={Megaphone} to="/announcements" actionLabel="View All">
          {latestSchoolAnnouncement ? (
            <>
              <p className="text-parchment text-sm mb-1 truncate">{latestSchoolAnnouncement.title}</p>
              <p className="text-parchment-dim text-xs">
                {formatDate(latestSchoolAnnouncement.publishedAt ?? latestSchoolAnnouncement.createdAt)}
              </p>
            </>
          ) : (
            <p className="text-parchment-dim text-sm">No school announcements available.</p>
          )}
        </DashboardWidget>

        <DashboardWidget title="Office Hours" icon={CalendarClock} to="/professor/office-hours" actionLabel="View Schedule">
          <p className="text-parchment-dim text-sm">Office hours have not yet been provided.</p>
        </DashboardWidget>
      </div>
    </div>
  );
}
