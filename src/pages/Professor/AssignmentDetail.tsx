import { useParams, Link } from "react-router-dom";
import { Percent, Users2 } from "lucide-react";
import { useProfessorAssignments } from "../../context/ProfessorAssignmentsContext";
import { useProfessorScope } from "../../utils/professorScope";
import { getCourse } from "../../data/courses";
import { Button } from "../../components/ui/Button";
import { ProfileField, ProfileSection } from "../../components/character/ProfileSection";
import { ManagedAssignmentStatusBadge } from "../../components/professor/ManagedAssignmentStatusBadge";
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
  const { teachingCoursesById, rosterByTeachingCourseId, assignments, loading } = useProfessorScope();

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
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-display text-gold-bright mb-2">Assignment Not Found</h1>
        <Link to="/professor/assignments" className="text-gold hover:text-gold-bright text-sm">
          &larr; Back to Assignment Management
        </Link>
      </div>
    );
  }

  const teachingCourse = teachingCoursesById.get(assignment.teachingCourseId);
  const course = teachingCourse ? getCourse(teachingCourse.courseId) : undefined;
  const roster = teachingCourse ? rosterByTeachingCourseId.get(teachingCourse.id) ?? [] : [];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/professor/assignments" className="text-gold hover:text-gold-bright text-xs">
        &larr; Back to Assignment Management
      </Link>

      <section className="border border-parchment-dim/20 rounded-sm px-6 py-6">
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
            className="px-8 py-3 font-body text-sm tracking-wide rounded-sm border bg-transparent text-parchment border-parchment-dim/50 hover:border-gold hover:text-gold transition-colors duration-200"
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
      </section>

      {roster.length > 0 && (
        <ProfileSection title="Enrolled Students" icon={Users2}>
          <p className="text-parchment-dim text-sm">
            {roster.length} student{roster.length === 1 ? "" : "s"} in {teachingCourse?.section} will see this
            assignment once it's published.
          </p>
        </ProfileSection>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Grade Submission" icon={Percent}>
          <p className="text-parchment-dim text-sm">
            Entering grades for this assignment will be available here once Grade Management is built in
            Phase 3C.
          </p>
        </ProfileSection>

        <ProfileSection title="Student Submission Review" icon={Users2}>
          <p className="text-parchment-dim text-sm">
            Reviewing what each student actually submitted will appear here once submissions are connected to
            the Professor Portal.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
