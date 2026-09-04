import { Link } from "react-router-dom";
import { Copy } from "lucide-react";
import { useProfessorAssignments } from "../../context/ProfessorAssignmentsContext";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";

function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

// Every Archived-status ManagedAssignment - past assignments kept for
// reference rather than deleted. Restoring one to Draft is a simple status
// change through ProfessorAssignmentsContext; nothing here is destructive.
//
// Authentication Foundation (Phase 6B): assignments/teachingCoursesById
// come from useProfessorScope(), already filtered to the signed-in
// professor's own sections; setStatus is still the write action from
// ProfessorAssignmentsContext (unchanged).
export function AssignmentArchivePage() {
  const { setStatus } = useProfessorAssignments();
  const { assignments, teachingCoursesById, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading archive…" />
      </div>
    );
  }

  const archived = assignments
    .filter((assignment) => assignment.status === "Archived")
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🗄️ Assignment Archive</h1>
        <p className="text-parchment-dim text-sm">Past assignments, kept for reference.</p>
      </div>

      <div className="flex flex-col gap-2">
        {archived.length === 0 ? (
          <p className="text-parchment-dim text-sm">Nothing archived yet.</p>
        ) : (
          archived.map((assignment) => {
            const teachingCourse = teachingCoursesById.get(assignment.teachingCourseId);
            const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
            return (
              <div key={assignment.id} className="border border-parchment-dim/20 rounded-sm px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <Link
                    to={`/professor/assignments/${assignment.id}`}
                    className="font-display text-lg text-parchment hover:text-gold-bright transition-colors"
                  >
                    {assignment.title}
                  </Link>
                  <Button variant="secondary" onClick={() => setStatus(assignment.id, "Draft")}>
                    Restore to Draft
                  </Button>
                </div>
                <p className="text-parchment-dim text-xs">
                  {course?.name ?? "Unknown Course"} &middot; {teachingCourse?.section ?? "Unassigned section"}{" "}
                  &middot; Was due {formatDueDate(assignment.dueDate)}
                </p>
              </div>
            );
          })
        )}
      </div>

      <ProfileSection title="Duplicate Assignment" icon={Copy}>
        <p className="text-parchment-dim text-sm">
          Copying an archived assignment into a new draft for next term will be available here in a future
          milestone.
        </p>
      </ProfileSection>
    </div>
  );
}
