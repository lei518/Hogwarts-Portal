import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { useAcademicData } from "../../context/AcademicDataContext";
import { AssignmentStatusBadge } from "../../components/academics/AssignmentStatusBadge";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import type { AssignmentDisplayStatus } from "../../types/academics";

function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Phase 2 - Real Academic Workflow. Only assignments from courses the
// student is actually enrolled in (see AcademicDataContext's
// enrolledCourseIds, backed by the live course_enrollments table) - never
// just a client-side year check. Status per assignment comes from the
// student's own real submissions.
export function AssignmentsPage() {
  const { state } = useGame();
  const { character } = state;
  const { assignments, coursesById, enrolledCourseIds, submissions, loading } = useAcademicData();

  if (!character) return null;

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading assignments…" />
      </div>
    );
  }

  const visible = assignments
    .filter((assignment) => enrolledCourseIds.has(assignment.courseId))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-8">
      <PageHeader
        title="Assignments"
        description="Coursework assigned across your enrolled courses."
        icon={ClipboardList}
      />

      {visible.length === 0 ? (
        <EmptyState icon={ClipboardList} message="No assignments have been posted yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((assignment) => {
            const course = coursesById.get(assignment.courseId);
            const submission = submissions.find((s) => s.assignmentId === assignment.id);
            const status: AssignmentDisplayStatus = submission?.status ?? "Not Submitted";
            return (
              <Card key={assignment.id} interactive className="p-0 overflow-hidden">
                <Link
                  to={`/assignments/${assignment.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg text-parchment truncate">
                      {assignment.itemType}: {assignment.title}
                    </p>
                    <p className="text-parchment-dim text-xs">
                      {course?.name ?? assignment.courseId} &middot; Due {formatDueDate(assignment.dueDate)}
                      {assignment.housePointsReward ? ` · +${assignment.housePointsReward} pts` : ""}
                    </p>
                  </div>
                  <AssignmentStatusBadge status={status} />
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
