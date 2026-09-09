import { Link } from "react-router-dom";
import { Copy, Archive } from "lucide-react";
import { useProfessorAssignments } from "../../context/ProfessorAssignmentsContext";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/Table";

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
      <PageHeader title="Assignment Archive" description="Past assignments, kept for reference." icon={Archive} />

      {archived.length === 0 ? (
        <EmptyState message="Nothing archived yet." icon={Archive} />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Assignment</Th>
              <Th>Course</Th>
              <Th>Was Due</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {archived.map((assignment) => {
              const teachingCourse = teachingCoursesById.get(assignment.teachingCourseId);
              const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
              return (
                <Tr key={assignment.id}>
                  <Td>
                    <Link
                      to={`/professor/assignments/${assignment.id}`}
                      className="text-parchment hover:text-gold-bright transition-colors"
                    >
                      {assignment.title}
                    </Link>
                  </Td>
                  <Td className="text-parchment-dim text-xs">
                    {course?.name ?? "Unknown Course"}
                    <br />
                    {teachingCourse?.section ?? "Unassigned section"}
                  </Td>
                  <Td className="text-parchment-dim text-xs">{formatDueDate(assignment.dueDate)}</Td>
                  <Td className="text-right">
                    <Button size="sm" variant="secondary" onClick={() => setStatus(assignment.id, "Draft")}>
                      Restore to Draft
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}

      <ProfileSection title="Duplicate Assignment" icon={Copy}>
        <p className="text-parchment-dim text-sm">Reuse an archived assignment as the starting point for a new one.</p>
      </ProfileSection>
    </div>
  );
}
