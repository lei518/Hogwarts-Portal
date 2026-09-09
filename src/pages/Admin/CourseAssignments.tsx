import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import type { Course } from "../../types/academics";
import type { Professor } from "../../types/resources";
import { coursesRepository } from "../../repositories/coursesRepository";
import { professorsRepository } from "../../repositories/professorsRepository";
import { courseAssignmentsRepository } from "../../repositories/courseAssignmentsRepository";
import { LoadingState } from "../../components/ui/LoadingState";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/Table";
import { Select } from "../../components/ui/Input";

const UNASSIGNED = "";

// Part 3 - Course ownership depends on professor assignments: an admin
// assigns a real professor account to a course here, and that live
// assignment (course_professor_assignments, see
// repositories/courseAssignmentsRepository.ts) is what every course-facing
// page across the Student and Professor Portals resolves "who teaches
// this" from - never a hardcoded name. A course with no assignment reads
// "To Be Assigned" everywhere it's shown, and still exists/shows up for
// the right academic year regardless.
export function CourseAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([coursesRepository.getAll(), professorsRepository.getAll()]).then(([loadedCourses, loadedProfessors]) => {
      if (cancelled) return;
      setCourses(loadedCourses);
      setProfessors(loadedProfessors);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAssign(courseId: string, professorUserId: string) {
    setSavingCourseId(courseId);
    setError(null);
    try {
      await courseAssignmentsRepository.assign(courseId, professorUserId || null);
      setCourses((prev) =>
        prev.map((course) => (course.id === courseId ? { ...course, professorId: professorUserId || null } : course))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this course's assignment.");
    } finally {
      setSavingCourseId(null);
    }
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading course assignments…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Course Assignments"
        description="Assign a professor to each course. Students see this assignment as soon as it's saved."
        icon={BookOpen}
      />

      {error && <p className="text-ember text-xs">{error}</p>}

      {courses.length === 0 ? (
        <EmptyState message="No courses on file." icon={BookOpen} />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Course</Th>
              <Th>Required Year</Th>
              <Th>Instructor</Th>
            </Tr>
          </Thead>
          <Tbody>
            {courses.map((course) => (
              <Tr key={course.id}>
                <Td>{course.name}</Td>
                <Td className="text-parchment-dim">Year {course.requiredYear}</Td>
                <Td>
                  {professors.length === 0 ? (
                    <span className="text-parchment-dim text-xs">No professors available.</span>
                  ) : (
                    <Select
                      value={course.professorId ?? UNASSIGNED}
                      onChange={(e) => handleAssign(course.id, e.target.value)}
                      disabled={savingCourseId === course.id}
                      aria-label={`Instructor for ${course.name}`}
                    >
                      <option value={UNASSIGNED}>To Be Assigned</option>
                      {professors.map((professor) => (
                        <option key={professor.id} value={professor.id}>
                          {professor.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
