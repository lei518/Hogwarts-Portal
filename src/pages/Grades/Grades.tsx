import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { useAcademicData } from "../../context/AcademicDataContext";
import { getAcademicSummary, getCourseGrade } from "../../utils/grades";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProfileField } from "../../components/character/ProfileSection";

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "#c9a646",
  Completed: "#6b9e6b",
  Incomplete: "#8a8478",
};

// Phase 2 - Real Academic Workflow. Grades is now the working academic
// record: every enrolled course, its assignments and their real scores,
// and a computed current grade - plus the header summary that used to be
// three separate pages (Academic Progress/Academic Standing/Semester
// Summary, all removed - see CLAUDE.md's Academics section). Nothing here
// is seeded; a grade only exists once a professor has actually graded a
// submission (see utils/grades.ts's getCourseGrade).
export function GradesPage() {
  const { state } = useGame();
  const { character } = state;
  const { courses, assignments, submissions, loading } = useAcademicData();

  if (!character) return null;

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading your grades…" />
      </div>
    );
  }

  const eligibleCourses = courses.filter((course) => course.requiredYear <= character.year);
  const summary = getAcademicSummary(character, courses);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <PageHeader title="Grades" description="Your current standing in each enrolled course." icon={GraduationCap} />

      <Card as="section" className="px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
        <ProfileField label="Standing" value={summary.standing} />
        <ProfileField label="Semester" value={summary.currentSemester} />
        <ProfileField label="Courses Completed" value={String(summary.coursesCompleted)} />
        <ProfileField label="Courses In Progress" value={String(summary.coursesInProgress)} />
        <ProfileField label="Assignments Submitted" value={String(summary.assignmentsSubmitted)} />
        <ProfileField label="House Points Earned" value={`+${summary.housePointsEarnedThroughAcademics}`} />
      </Card>

      {eligibleCourses.length === 0 ? (
        <EmptyState message="No courses assigned." icon={GraduationCap} />
      ) : (
        <div className="flex flex-col gap-4">
          {eligibleCourses.map((course) => {
            const courseAssignments = assignments.filter((assignment) => assignment.courseId === course.id);
            const grade = getCourseGrade(course.id);
            const color = STATUS_COLORS[grade.status];
            return (
              <Card key={course.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Link
                    to={`/courses/${course.id}`}
                    className="font-display text-lg text-parchment hover:text-gold-bright transition-colors"
                  >
                    {course.name}
                  </Link>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl" style={{ color }}>
                      {grade.currentGrade}
                    </p>
                  </div>
                </div>

                {courseAssignments.length === 0 ? (
                  <p className="text-parchment-dim text-sm">No assignments published yet.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {courseAssignments.map((assignment) => {
                      const submission = submissions.find((s) => s.assignmentId === assignment.id);
                      return (
                        <div key={assignment.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-parchment-dim truncate">
                            {assignment.itemType}: {assignment.title}
                          </span>
                          <span className="text-parchment-dim shrink-0">
                            {submission?.status === "Graded"
                              ? `${submission.score}/${submission.maxScore}`
                              : submission?.status ?? "Not Submitted"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-parchment-dim text-xs mt-3">{grade.remarks}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
