import { Link } from "react-router-dom";
import { ListTodo, ClipboardCheck } from "lucide-react";
import { useProfessorAssignments } from "../../context/ProfessorAssignmentsContext";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";

function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Every Draft-status ManagedAssignment, gathered in one place so a
// professor can review and publish them before students ever see them.
// This is an authoring review step, not student-submission review (that
// stays a reserved section on Assignment Detail).
//
// Authentication Foundation (Phase 6B): assignments/teachingCoursesById
// come from useProfessorScope(), already filtered to the signed-in
// professor's own sections; setStatus is still the write action from
// ProfessorAssignmentsContext (unchanged).
export function AssignmentReviewQueuePage() {
  const { setStatus } = useProfessorAssignments();
  const { assignments, teachingCoursesById, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading review queue…" />
      </div>
    );
  }

  const drafts = assignments
    .filter((assignment) => assignment.status === "Draft")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Review Queue"
        description="Drafts waiting for your review before they go out."
        icon={ClipboardCheck}
      />

      {drafts.length === 0 ? (
        <EmptyState message="Nothing waiting for review - every draft has been published." icon={ClipboardCheck} />
      ) : (
        <div className="flex flex-col gap-3">
          {drafts.map((assignment) => {
            const teachingCourse = teachingCoursesById.get(assignment.teachingCourseId);
            const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
            return (
              <Card key={assignment.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <Link
                    to={`/professor/assignments/${assignment.id}`}
                    className="font-display text-lg text-parchment hover:text-gold-bright transition-colors"
                  >
                    {assignment.title}
                  </Link>
                  <Button size="sm" onClick={() => setStatus(assignment.id, "Published")}>
                    Publish
                  </Button>
                </div>
                <p className="text-parchment-dim text-xs mb-2">
                  {course?.name ?? "Unknown Course"} &middot; {teachingCourse?.section ?? "Unassigned section"}{" "}
                  &middot; Due {formatDueDate(assignment.dueDate)}
                </p>
                <p className="text-parchment-dim text-sm">{assignment.description}</p>
              </Card>
            );
          })}
        </div>
      )}

      <ProfileSection title="Bulk Publish" icon={ListTodo}>
        <p className="text-parchment-dim text-sm">Publish several drafts from the review queue at once.</p>
      </ProfileSection>
    </div>
  );
}
