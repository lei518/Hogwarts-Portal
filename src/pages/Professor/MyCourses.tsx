import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { getCourse } from "../../data/courses";
import { useProfessorScope } from "../../utils/professorScope";
import { getAveragePercentage } from "../../utils/professorGrades";
import { ProfileSection } from "../../components/character/ProfileSection";
import { ManagedAssignmentStatusBadge } from "../../components/professor/ManagedAssignmentStatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";

function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Canonical owner of teaching information (which sections this professor
// teaches, meeting pattern, roster linkage) - see CLAUDE.md's Professor
// Portal section. The underlying Course record (name, classroom, description)
// stays Resources' own data; this page only reads it via getCourse, never
// duplicates it.
//
// Authentication Foundation (Phase 6B): teachingCourses/roster/assignments/
// submissions all come from useProfessorScope(), already filtered to the
// signed-in professor - this page no longer reads data/professorPortal.ts
// directly, and no longer assumes Professor Snape.
export function MyCoursesPage() {
  const { teachingCourses, rosterByTeachingCourseId, assignments, submissions, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading your courses…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📖 My Courses</h1>
        <p className="text-parchment-dim text-sm">The sections you teach this year.</p>
      </div>

      {teachingCourses.length === 0 ? (
        <p className="text-parchment-dim text-sm border border-parchment-dim/15 rounded-sm px-5 py-8 text-center">
          No courses on file for your account yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teachingCourses.map((teachingCourse) => {
            const course = getCourse(teachingCourse.courseId);
            const roster = rosterByTeachingCourseId.get(teachingCourse.id) ?? [];
            const courseAssignments = assignments.filter((a) => a.teachingCourseId === teachingCourse.id);
            const draftCount = courseAssignments.filter((a) => a.status === "Draft").length;
            const publishedCount = courseAssignments.filter((a) => a.status === "Published").length;
            const assignmentIds = new Set(courseAssignments.map((a) => a.id));
            const courseSubmissions = submissions.filter((s) => assignmentIds.has(s.managedAssignmentId));
            const pendingReviews = courseSubmissions.filter((s) => s.status === "Pending").length;
            const reviewedCount = courseSubmissions.filter((s) => s.status !== "Pending").length;
            const averagePercentage = getAveragePercentage(courseSubmissions);

            return (
              <div key={teachingCourse.id} className="border border-parchment-dim/20 rounded-sm px-5 py-4">
                <p className="font-display text-lg text-parchment mb-1">{course?.name ?? teachingCourse.courseId}</p>
                <p className="text-parchment-dim text-xs mb-3">{teachingCourse.section}</p>
                <div className="flex flex-col gap-1.5 text-sm text-parchment-dim mb-4">
                  <p>{teachingCourse.meetingPattern}</p>
                  {course && <p>{course.classroom}</p>}
                  <p>
                    {roster.length} student{roster.length === 1 ? "" : "s"} enrolled
                  </p>
                </div>

                <div className="border-t border-parchment-dim/10 pt-3">
                  <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-2">
                    {courseAssignments.length} assignment{courseAssignments.length === 1 ? "" : "s"} &middot;{" "}
                    {publishedCount} published &middot; {draftCount} draft{draftCount === 1 ? "" : "s"}
                  </p>
                  {courseAssignments.length === 0 ? (
                    <p className="text-parchment-dim text-sm">No assignments yet for this section.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {courseAssignments.map((assignment) => (
                        <Link
                          key={assignment.id}
                          to={`/professor/assignments/${assignment.id}`}
                          className="flex items-center justify-between gap-2 text-sm hover:text-gold-bright transition-colors"
                        >
                          <span className="text-parchment truncate">{assignment.title}</span>
                          <span className="flex items-center gap-2 shrink-0">
                            <span className="text-parchment-dim text-xs">{formatDueDate(assignment.dueDate)}</span>
                            <ManagedAssignmentStatusBadge status={assignment.status} />
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-parchment-dim/10 pt-3 mt-3">
                  <p className="text-parchment-dim text-[11px] uppercase tracking-wide mb-1">Grading</p>
                  <p className="text-parchment-dim text-sm">
                    {pendingReviews} pending review{pendingReviews === 1 ? "" : "s"} &middot; {reviewedCount}{" "}
                    reviewed &middot; Average{" "}
                    {averagePercentage === null ? "not yet available" : `${averagePercentage}%`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProfileSection title="Course Materials" icon={BookOpen}>
        <p className="text-parchment-dim text-sm">
          Lesson plans and shared reading will live here once course material authoring is available.
        </p>
      </ProfileSection>
    </div>
  );
}
