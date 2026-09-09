import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, BarChart3, GraduationCap, ClipboardList } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { ProfileSection } from "../../components/character/ProfileSection";
import { SubmissionStatusBadge } from "../../components/professor/SubmissionStatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/Table";

type SortKey = "student" | "course" | "grade";

const SORT_LABELS: Record<SortKey, string> = {
  student: "Student",
  course: "Course",
  grade: "Grade",
};

// Every graded submission across every course, sortable by student,
// course, or grade - a read-only view over the live `assignment_submissions`
// table (see context/ProfessorGradesContext.tsx).
export function ProfessorGradebookPage() {
  const { submissions, assignments, teachingCoursesById, studentsById, loading } = useProfessorScope();
  const [sortKey, setSortKey] = useState<SortKey>("student");
  const navigate = useNavigate();

  const rows = useMemo(() => {
    const graded = submissions.filter((submission) => submission.status === "Graded");
    const withContext = graded.map((submission) => {
      const assignment = assignments.find((a) => a.id === submission.assignmentId);
      const teachingCourse = assignment ? teachingCoursesById.get(assignment.teachingCourseId) : undefined;
      const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
      const student = studentsById.get(submission.studentUserId);
      const percentage =
        submission.score !== undefined && submission.maxScore
          ? Math.round((submission.score / submission.maxScore) * 100)
          : null;
      return { submission, assignment, teachingCourse, course, student, percentage };
    });

    return withContext.sort((a, b) => {
      if (sortKey === "student")
        return (a.student?.studentName ?? "").localeCompare(b.student?.studentName ?? "");
      if (sortKey === "course") return (a.course?.name ?? "").localeCompare(b.course?.name ?? "");
      return (b.percentage ?? -1) - (a.percentage ?? -1);
    });
  }, [submissions, sortKey, assignments, teachingCoursesById, studentsById]);

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading gradebook…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Gradebook"
        description="Every graded submission across your courses."
        icon={GraduationCap}
      />

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

      {rows.length === 0 ? (
        <EmptyState message="No graded submissions yet." icon={ClipboardList} />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Student</Th>
              <Th>Course</Th>
              <Th>Assignment</Th>
              <Th>Score</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map(({ submission, assignment, teachingCourse, course, student, percentage }) => (
              <Tr
                key={submission.id}
                interactive
                className="cursor-pointer"
                onClick={() => navigate(`/professor/grades/${submission.id}`)}
              >
                <Td className="text-parchment">{student?.studentName ?? "Unknown Student"}</Td>
                <Td className="text-parchment-dim text-xs">
                  {course?.name ?? "Unknown Course"}
                  <br />
                  {teachingCourse?.section ?? "Unassigned section"}
                </Td>
                <Td className="text-parchment-dim text-xs">{assignment?.title ?? "Unknown Assignment"}</Td>
                <Td className="text-parchment-dim text-xs">
                  {percentage === null ? "—" : `${submission.score}/${submission.maxScore} (${percentage}%)`}
                </Td>
                <Td>
                  <SubmissionStatusBadge status={submission.status} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Export CSV" icon={Download}>
          <p className="text-parchment-dim text-sm">Save the gradebook as a spreadsheet for your own records.</p>
        </ProfileSection>

        <ProfileSection title="Analytics" icon={BarChart3}>
          <p className="text-parchment-dim text-sm">Grade distributions and trends across your sections.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
