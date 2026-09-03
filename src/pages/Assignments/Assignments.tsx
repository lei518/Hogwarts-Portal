import { Link } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import { getAllAssignments } from "../../data/assignments";
import { getCourse } from "../../data/courses";
import { AssignmentStatusBadge } from "../../components/academics/AssignmentStatusBadge";
import type { AssignmentStatus } from "../../types/academics";

function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AssignmentsPage() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const assignments = getAllAssignments()
    .filter((assignment) => assignment.requiredYear <= character.year)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📝 Assignments</h1>
      <p className="text-parchment-dim text-sm mb-8">Coursework assigned across your enrolled courses.</p>

      {assignments.length === 0 ? (
        <p className="text-parchment-dim text-sm border border-parchment-dim/15 rounded-sm px-5 py-8 text-center">
          No assignments have been posted yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {assignments.map((assignment) => {
            const course = getCourse(assignment.courseId);
            const status: AssignmentStatus =
              character.assignmentSubmissions[assignment.id]?.status ?? "Not Started";
            return (
              <Link
                key={assignment.id}
                to={`/assignments/${assignment.id}`}
                className="flex items-center justify-between gap-3 border border-parchment-dim/20 rounded-sm px-5 py-4 hover:border-gold transition-colors duration-150"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg text-parchment truncate">{assignment.title}</p>
                  <p className="text-parchment-dim text-xs">
                    {course?.name ?? assignment.courseId} &middot; Due {formatDueDate(assignment.dueDate)}
                    {assignment.housePointsReward ? ` · +${assignment.housePointsReward} pts` : ""}
                  </p>
                </div>
                <AssignmentStatusBadge status={status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
