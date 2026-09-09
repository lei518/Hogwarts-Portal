import { Link } from "react-router-dom";
import { Clock, CheckCircle2, Percent, AlarmClockOff, BookOpen } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { getAveragePercentage } from "../../utils/professorGrades";
import { DashboardWidget } from "../../components/dashboard/DashboardWidget";
import { ProfileSection } from "../../components/character/ProfileSection";
import { SubmissionStatusBadge } from "../../components/professor/SubmissionStatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Grade Management's overview - summaries and the two working lists
// (waiting / graded), same "widgets, owns no data of its own" rule as
// every other Dashboard in the portal. Phase 2 - canonical submission data
// now lives in the live `assignment_submissions` table (see
// context/ProfessorGradesContext.tsx); "waiting" means Submitted or Late,
// not yet Graded.
export function ProfessorGradeDashboardPage() {
  const { submissions, assignments, teachingCoursesById, studentsById, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto">
        <LoadingState label="Loading grade overview…" />
      </div>
    );
  }

  const waiting = [...submissions]
    .filter((submission) => submission.status !== "Graded")
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const graded = [...submissions]
    .filter((submission) => submission.status === "Graded")
    .sort((a, b) => (b.gradedAt ?? "").localeCompare(a.gradedAt ?? ""));
  const averagePercentage = getAveragePercentage(submissions);

  function describeAssignment(assignmentId: string) {
    const assignment = assignments.find((a) => a.id === assignmentId);
    const teachingCourse = assignment ? teachingCoursesById.get(assignment.teachingCourseId) : undefined;
    const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
    return { assignment, teachingCourse, course };
  }

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Grade Management"
        description="Submissions across every course, waiting on you or already graded."
        icon={Percent}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardWidget title="Waiting on You" icon={Clock}>
          <p className="text-parchment text-2xl font-display">{waiting.length}</p>
        </DashboardWidget>
        <DashboardWidget title="Graded" icon={CheckCircle2} to="/professor/grades/gradebook" actionLabel="Gradebook">
          <p className="text-parchment text-2xl font-display">{graded.length}</p>
        </DashboardWidget>
        <DashboardWidget title="Average Grade" icon={Percent}>
          <p className="text-parchment text-2xl font-display">
            {averagePercentage === null ? "—" : `${averagePercentage}%`}
          </p>
        </DashboardWidget>
      </div>

      <ProfileSection title="Submissions Waiting" icon={Clock}>
        {waiting.length === 0 ? (
          <p className="text-parchment-dim text-sm">Nothing waiting on you - every submission has been graded.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {waiting.map((submission) => {
              const { assignment, teachingCourse, course } = describeAssignment(submission.assignmentId);
              return (
                <Link
                  key={submission.id}
                  to={`/professor/grades/${submission.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:text-gold-bright transition-colors border-b border-parchment-dim/10 pb-2 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-parchment truncate">
                      {studentsById.get(submission.studentUserId)?.studentName ?? "Unknown Student"}
                    </p>
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

      <ProfileSection title="Recently Graded" icon={CheckCircle2}>
        {graded.length === 0 ? (
          <p className="text-parchment-dim text-sm">Nothing graded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {graded.slice(0, 5).map((submission) => {
              const { assignment } = describeAssignment(submission.assignmentId);
              return (
                <Link
                  key={submission.id}
                  to={`/professor/grades/${submission.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:text-gold-bright transition-colors"
                >
                  <span className="text-parchment truncate">
                    {studentsById.get(submission.studentUserId)?.studentName ?? "Unknown Student"} &middot;{" "}
                    {assignment?.title ?? "Unknown Assignment"}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    {submission.score !== undefined && (
                      <span className="text-parchment-dim text-xs">
                        {submission.score}/{submission.maxScore}
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
            Submissions marked Late above are flagged automatically against each assignment's due date.
          </p>
        </ProfileSection>

        <ProfileSection title="Feedback Library" icon={BookOpen}>
          <p className="text-parchment-dim text-sm">Keep frequently-used feedback on hand for faster grading.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
