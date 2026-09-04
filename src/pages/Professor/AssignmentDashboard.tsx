import { Link } from "react-router-dom";
import { NotebookPen, ListChecks, Archive as ArchiveIcon, Plus, Sparkles, ListTodo } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { DashboardWidget } from "../../components/dashboard/DashboardWidget";
import { ProfileSection } from "../../components/character/ProfileSection";
import { ManagedAssignmentStatusBadge } from "../../components/professor/ManagedAssignmentStatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";

function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Assignment Management's overview - summaries and the full list, same
// "widgets, owns no data of its own" rule as every other Dashboard in the
// portal. Canonical assignment data lives in ProfessorAssignmentsContext.
//
// Authentication Foundation (Phase 6B): assignments/teachingCoursesById
// come from useProfessorScope(), already filtered to the signed-in
// professor's own sections.
export function AssignmentDashboardPage() {
  const { assignments, teachingCoursesById, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto">
        <LoadingState label="Loading assignments…" />
      </div>
    );
  }

  const draftCount = assignments.filter((a) => a.status === "Draft").length;
  const publishedCount = assignments.filter((a) => a.status === "Published").length;
  const archivedCount = assignments.filter((a) => a.status === "Archived").length;
  const sorted = [...assignments].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-1">📝 Assignment Management</h1>
          <p className="text-parchment-dim text-sm">Everything you've assigned, across every section.</p>
        </div>
        <Link
          to="/professor/assignments/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 font-body text-sm tracking-wide rounded-sm border bg-gold text-ink border-gold hover:bg-gold-bright hover:border-gold-bright transition-colors duration-200"
        >
          <Plus size={16} /> New Assignment
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardWidget title="Published" icon={NotebookPen}>
          <p className="text-parchment text-2xl font-display">{publishedCount}</p>
        </DashboardWidget>
        <DashboardWidget title="Drafts" icon={ListChecks} to="/professor/assignments/review" actionLabel="Review Queue">
          <p className="text-parchment text-2xl font-display">{draftCount}</p>
        </DashboardWidget>
        <DashboardWidget title="Archived" icon={ArchiveIcon} to="/professor/assignments/archive" actionLabel="View Archive">
          <p className="text-parchment text-2xl font-display">{archivedCount}</p>
        </DashboardWidget>
      </div>

      <ProfileSection title="All Assignments" icon={NotebookPen}>
        {sorted.length === 0 ? (
          <p className="text-parchment-dim text-sm">No assignments yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((assignment) => {
              const teachingCourse = teachingCoursesById.get(assignment.teachingCourseId);
              const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
              return (
                <Link
                  key={assignment.id}
                  to={`/professor/assignments/${assignment.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:text-gold-bright transition-colors border-b border-parchment-dim/10 pb-2 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-parchment truncate">{assignment.title}</p>
                    <p className="text-parchment-dim text-xs truncate">
                      {course?.name ?? "Unknown Course"} &middot; {teachingCourse?.section ?? "Unassigned section"}{" "}
                      &middot; Due {formatDueDate(assignment.dueDate)}
                    </p>
                  </div>
                  <ManagedAssignmentStatusBadge status={assignment.status} />
                </Link>
              );
            })}
          </div>
        )}
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="AI Assignment Generator" icon={Sparkles}>
          <p className="text-parchment-dim text-sm">
            Generating a first draft from a short prompt will be available here in a future milestone.
          </p>
        </ProfileSection>

        <ProfileSection title="Bulk Publish" icon={ListTodo}>
          <p className="text-parchment-dim text-sm">
            Publishing every ready draft at once, instead of one at a time, will be available here in a future
            milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
