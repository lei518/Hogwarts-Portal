import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, BarChart3 } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { ProfileSection } from "../../components/character/ProfileSection";
import { SubmissionStatusBadge } from "../../components/professor/SubmissionStatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";

type SortKey = "student" | "course" | "grade";

const SORT_LABELS: Record<SortKey, string> = {
  student: "Student",
  course: "Course",
  grade: "Grade",
};

// Every reviewed (or returned) submission across every section, sortable
// by student, course, or grade - a read-only view over
// ProfessorGradesContext's state, same "owns nothing, reflects the
// canonical source" rule as every list page in this portal.
//
// Authentication Foundation (Phase 6B): submissions/assignments/
// teachingCoursesById come from useProfessorScope(), already filtered to
// the signed-in professor's own sections.
export function ProfessorGradebookPage() {
  const { submissions, assignments, teachingCoursesById, loading } = useProfessorScope();
  const [sortKey, setSortKey] = useState<SortKey>("student");

  const rows = useMemo(() => {
    const reviewed = submissions.filter((submission) => submission.status !== "Pending");
    const withContext = reviewed.map((submission) => {
      const assignment = assignments.find((a) => a.id === submission.managedAssignmentId);
      const teachingCourse = assignment ? teachingCoursesById.get(assignment.teachingCourseId) : undefined;
      const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
      const percentage = submission.grade
        ? Math.round((submission.grade.score / submission.grade.maxScore) * 100)
        : null;
      return { submission, assignment, teachingCourse, course, percentage };
    });

    return withContext.sort((a, b) => {
      if (sortKey === "student") return a.submission.studentName.localeCompare(b.submission.studentName);
      if (sortKey === "course") return (a.course?.name ?? "").localeCompare(b.course?.name ?? "");
      return (b.percentage ?? -1) - (a.percentage ?? -1);
    });
  }, [submissions, sortKey, assignments, teachingCoursesById]);

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading gradebook…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📔 Gradebook</h1>
        <p className="text-parchment-dim text-sm">Every reviewed submission across your sections.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={`text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
              sortKey === key
                ? "border-gold text-gold-bright bg-gold/10"
                : "border-parchment-dim/25 text-parchment-dim hover:border-gold/50"
            }`}
          >
            Sort by {SORT_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <p className="text-parchment-dim text-sm">No reviewed submissions yet.</p>
        ) : (
          rows.map(({ submission, assignment, teachingCourse, course, percentage }) => (
            <Link
              key={submission.id}
              to={`/professor/grades/${submission.id}`}
              className="flex items-center justify-between gap-3 text-sm border border-parchment-dim/20 rounded-sm px-5 py-3 hover:border-gold transition-colors"
            >
              <div className="min-w-0">
                <p className="text-parchment truncate">{submission.studentName}</p>
                <p className="text-parchment-dim text-xs truncate">
                  {course?.name ?? "Unknown Course"} &middot; {teachingCourse?.section ?? "Unassigned section"}{" "}
                  &middot; {assignment?.title ?? "Unknown Assignment"}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-parchment-dim text-xs">
                  {percentage === null
                    ? "—"
                    : `${submission.grade?.score}/${submission.grade?.maxScore} (${percentage}%)`}
                </span>
                <SubmissionStatusBadge status={submission.status} />
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Export CSV" icon={Download}>
          <p className="text-parchment-dim text-sm">
            Downloading the gradebook as a spreadsheet will be available here in a future milestone.
          </p>
        </ProfileSection>

        <ProfileSection title="Analytics" icon={BarChart3}>
          <p className="text-parchment-dim text-sm">
            Grade distributions and trends across your sections will appear here in a future milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
