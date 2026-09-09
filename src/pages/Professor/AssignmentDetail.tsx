import { useParams, Link } from "react-router-dom";
import { Users2, ArrowLeft, NotebookPen } from "lucide-react";
import { useProfessorAssignments } from "../../context/ProfessorAssignmentsContext";
import { useProfessorGrades } from "../../context/ProfessorGradesContext";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProfileField, ProfileSection } from "../../components/character/ProfileSection";
import { ManagedAssignmentStatusBadge } from "../../components/professor/ManagedAssignmentStatusBadge";
import { SubmissionStatusBadge } from "../../components/professor/SubmissionStatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";

function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Read view for one ManagedAssignment, plus the status actions that move it
// through the authoring workflow (Draft -> Published -> Archived). Grading
// isn't built yet - see the two reserved sections below, same pattern as
// the Student Portal's AssignmentDetailPage's own "not built yet" comment.
//
// Authentication Foundation (Phase 6B): setStatus is still the write action
// from ProfessorAssignmentsContext (unchanged), but the assignment lookup
// is scoped to the signed-in professor's own teaching courses via
// useProfessorScope() - an assignment belonging to another professor reads
// as Not Found, the same honest scoping every other page uses.
export function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setStatus } = useProfessorAssignments();
  const { getSubmissionsForAssignment } = useProfessorGrades();
  const { teachingCoursesById, rosterByTeachingCourseId, studentsById, assignments, loading } = useProfessorScope();

  const assignment = id ? assignments.find((a) => a.id === id) : undefined;

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading assignment…" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <EmptyState
          message="Assignment not found."
          icon={NotebookPen}
          action={
            <Link to="/professor/assignments" className="text-gold hover:text-gold-bright text-sm">
              &larr; Back to Assignment Management
            </Link>
          }
        />
      </div>
    );
  }

  const teachingCourse = teachingCoursesById.get(assignment.teachingCourseId);
  const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
  const roster = teachingCourse ? rosterByTeachingCourseId.get(teachingCourse.id) ?? [] : [];
  const submissions = getSubmissionsForAssignment(assignment.id);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/professor/assignments" className="flex items-center gap-1.5 text-gold hover:text-gold-bright text-xs w-fit">
        <ArrowLeft size={14} />
        Back to Assignment Management
      </Link>

      <Card as="section" className="px-6 py-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl md:text-3xl font-display text-gold-bright">{assignment.title}</h1>
          <ManagedAssignmentStatusBadge status={assignment.status} />
        </div>
        <p className="text-parchment-dim text-sm mb-4">
          {course?.name ?? "Unknown Course"} &middot; {teachingCourse?.section ?? "Unassigned section"}
        </p>
        <p className="text-parchment text-sm leading-relaxed mb-5">{assignment.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <ProfileField label="Due Date" value={formatDueDate(assignment.dueDate)} />
          <ProfileField
            label="House Points"
            value={assignment.housePointsReward ? `+${assignment.housePointsReward}` : "None"}
          />
          <ProfileField label="Max Grade" value={assignment.maxGrade ?? "Not set"} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/professor/assignments/${assignment.id}/edit`}
            className="inline-flex items-center px-6 py-2.5 font-body font-medium text-sm tracking-wide rounded-md border bg-transparent text-parchment border-parchment-dim/40 hover:border-gold hover:text-gold-bright hover:-translate-y-px transition-all duration-200"
          >
            Edit
          </Link>
          {assignment.status === "Draft" && (
            <Button onClick={() => setStatus(assignment.id, "Published")}>Publish</Button>
          )}
          {assignment.status === "Published" && (
            <Button variant="secondary" onClick={() => setStatus(assignment.id, "Archived")}>
              Archive
            </Button>
          )}
          {assignment.status === "Archived" && (
            <Button variant="secondary" onClick={() => setStatus(assignment.id, "Draft")}>
              Restore to Draft
            </Button>
          )}
        </div>
      </Card>

      {roster.length > 0 && (
        <ProfileSection title="Enrolled Students" icon={Users2}>
          <p className="text-parchment-dim text-sm">
            {roster.length} student{roster.length === 1 ? "" : "s"} in {teachingCourse?.section} will see this
            assignment once it's published.
          </p>
        </ProfileSection>
      )}

      <ProfileSection title="Student Submissions" icon={Users2}>
        {submissions.length === 0 ? (
          <p className="text-parchment-dim text-sm">No submissions yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {submissions.map((submission) => (
              <Link
                key={submission.id}
                to={`/professor/grades/${submission.id}`}
                className="flex items-center justify-between gap-3 text-sm hover:text-gold-bright transition-colors border-b border-parchment-dim/10 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-parchment truncate">
                  {studentsById.get(submission.studentUserId)?.studentName ?? "Unknown Student"}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {submission.status === "Graded" && (
                    <span className="text-parchment-dim text-xs">
                      {submission.score}/{submission.maxScore}
                    </span>
                  )}
                  <SubmissionStatusBadge status={submission.status} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </ProfileSection>
    </div>
  );
}
