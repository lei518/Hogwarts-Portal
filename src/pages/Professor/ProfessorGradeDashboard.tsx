import { Link } from "react-router-dom";
import { Clock, CheckCircle2, Percent, AlarmClockOff, Sparkles } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { getAveragePercentage } from "../../utils/professorGrades";
import { DashboardWidget } from "../../components/dashboard/DashboardWidget";
import { ProfileSection } from "../../components/character/ProfileSection";
import { SubmissionStatusBadge } from "../../components/professor/SubmissionStatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Grade Management's overview - summaries and the two working lists
// (waiting / recently reviewed), same "widgets, owns no data of its own"
// rule as every other Dashboard in the portal. Canonical submission data
// lives in ProfessorGradesContext.
//
// Authentication Foundation (Phase 6B): submissions/assignments/
// teachingCoursesById come from useProfessorScope(), already filtered to
// the signed-in professor's own sections.
export function ProfessorGradeDashboardPage() {
  const { submissions, assignments, teachingCoursesById, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto">
        <LoadingState label="Loading grade overview…" />
      </div>
    );
  }

  const pending = [...submissions]
    .filter((submission) => submission.status === "Pending")
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const reviewed = [...submissions]
    .filter((submission) => submission.status !== "Pending")
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const averagePercentage = getAveragePercentage(submissions);

  function describeAssignment(managedAssignmentId: string) {
    const assignment = assignments.find((a) => a.id === managedAssignmentId);
    const teachingCourse = assignment ? teachingCoursesById.get(assignment.teachingCourseId) : undefined;
    const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
    return { assignment, teachingCourse, course };
  }

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-1">📊 Grade Management</h1>
        <p className="text-parchment-dim text-sm">
          Submissions across every section, waiting on you or already reviewed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardWidget title="Pending Reviews" icon={Clock}>
          <p className="text-parchment text-2xl font-display">{pending.length}</p>
        </DashboardWidget>
        <DashboardWidget title="Recently Reviewed" icon={CheckCircle2} to="/professor/grades/gradebook" actionLabel="Gradebook">
          <p className="text-parchment text-2xl font-display">{reviewed.length}</p>
        </DashboardWidget>
        <DashboardWidget title="Average Grade" icon={Percent}>
          <p className="text-parchment text-2xl font-display">
            {averagePercentage === null ? "—" : `${averagePercentage}%`}
          </p>
        </DashboardWidget>
      </div>

      <ProfileSection title="Submissions Waiting" icon={Clock}>
        {pending.length === 0 ? (
          <p className="text-parchment-dim text-sm">Nothing waiting on you - every submission has been reviewed.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map((submission) => {
              const { assignment, teachingCourse, course } = describeAssignment(submission.managedAssignmentId);
              return (
                <Link
                  key={submission.id}
                  to={`/professor/grades/${submission.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:text-gold-bright transition-colors border-b border-parchment-dim/10 pb-2 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-parchment truncate">{submission.studentName}</p>
                    <p className="text-parchment-dim text-xs truncate">
                      {assignment?.title ?? "Unknown Assignment"} &middot; {course?.name ?? "Unknown Course"}{" "}
                      &middot; {teachingCourse?.section ?? "Unassigned section"} &middot; Submitted{" "}
                      {formatDate(submission.submittedAt)}
                    </p>
                  </div>
                  <SubmissionStatusBadge status={submission.status} />
                </Link>
              );
            })}
          </div>
        )}
      </ProfileSection>

      <ProfileSection title="Recently Reviewed" icon={CheckCircle2}>
        {reviewed.length === 0 ? (
          <p className="text-parchment-dim text-sm">Nothing reviewed yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {reviewed.slice(0, 5).map((submission) => {
              const { assignment } = describeAssignment(submission.managedAssignmentId);
              return (
                <Link
                  key={submission.id}
                  to={`/professor/grades/${submission.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:text-gold-bright transition-colors"
                >
                  <span className="text-parchment truncate">
                    {submission.studentName} &middot; {assignment?.title ?? "Unknown Assignment"}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    {submission.grade && (
                      <span className="text-parchment-dim text-xs">
                        {submission.grade.score}/{submission.grade.maxScore}
                      </span>
                    )}
                    <SubmissionStatusBadge status={submission.status} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Late Submission Detection" icon={AlarmClockOff}>
          <p className="text-parchment-dim text-sm">
            Flagging submissions that came in after an assignment's due date will be available here in a
            future milestone.
          </p>
        </ProfileSection>

        <ProfileSection title="AI Feedback Assistant" icon={Sparkles}>
          <p className="text-parchment-dim text-sm">
            Suggesting feedback based on what a student submitted will be available here in a future
            milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
