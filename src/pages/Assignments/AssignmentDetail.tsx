import { useParams, Link } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import { getAssignment } from "../../data/assignments";
import { getCourse } from "../../data/courses";
import { Button } from "../../components/ui/Button";
import { AssignmentStatusBadge } from "../../components/academics/AssignmentStatusBadge";
import { ProfileField } from "../../components/character/ProfileSection";
import type { AssignmentStatus } from "../../types/academics";

function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Grading isn't built yet - the "Grade" field below reads
// AssignmentSubmission.grade so it starts working the moment a future
// Professor Portal sets it, with no change needed here.
export function AssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { state, dispatch } = useGame();
  const { character } = state;

  const assignment = assignmentId ? getAssignment(assignmentId) : undefined;

  if (!character) return null;

  if (!assignment) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-display text-gold-bright mb-2">Assignment Not Found</h1>
        <Link to="/assignments" className="text-gold hover:text-gold-bright text-sm">
          &larr; Back to Assignments
        </Link>
      </div>
    );
  }

  const course = getCourse(assignment.courseId);
  const submission = character.assignmentSubmissions[assignment.id];
  const status: AssignmentStatus = submission?.status ?? "Not Started";

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/assignments" className="text-gold hover:text-gold-bright text-xs">
        &larr; Back to Assignments
      </Link>

      <section className="border border-parchment-dim/20 rounded-sm px-6 py-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl md:text-3xl font-display text-gold-bright">{assignment.title}</h1>
          <AssignmentStatusBadge status={status} />
        </div>
        <p className="text-parchment-dim text-sm mb-4">
          {course ? (
            <Link to={`/courses/${course.id}`} className="text-gold hover:text-gold-bright">
              {course.name}
            </Link>
          ) : (
            assignment.courseId
          )}
        </p>
        <p className="text-parchment text-sm leading-relaxed mb-5">{assignment.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
          <ProfileField label="Due Date" value={formatDueDate(assignment.dueDate)} />
          <ProfileField
            label="House Points"
            value={assignment.housePointsReward ? `+${assignment.housePointsReward}` : "None"}
          />
          <ProfileField label="Grade" value={submission?.grade ?? "Not yet graded"} />
        </div>

        {status === "Not Started" ? (
          <Button onClick={() => dispatch({ type: "SUBMIT_ASSIGNMENT", payload: { assignmentId: assignment.id } })}>
            Mark as Submitted
          </Button>
        ) : (
          <p className="text-gold text-sm">
            ✓ Submitted{submission?.submittedAt ? ` on ${formatDueDate(submission.submittedAt.slice(0, 10))}` : ""}
          </p>
        )}
      </section>
    </div>
  );
}
