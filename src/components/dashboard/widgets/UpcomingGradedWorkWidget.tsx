import { useGame } from "../../../context/GameContext";
import { getUpcomingAssignments } from "../../../utils/academics";
import { getCourse } from "../../../data/courses";
import { DashboardWidget } from "../DashboardWidget";
import { NotebookPen } from "lucide-react";

// Phase 3D - reuses the same getUpcomingAssignments Assignments already
// exports (see utils/academics.ts), which is bridge-aware as of Milestone A
// - a Published ManagedAssignment appears here exactly like a seeded one,
// with no changes needed in either place.
export function UpcomingGradedWorkWidget() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const upcoming = getUpcomingAssignments(character, 3);

  return (
    <DashboardWidget title="Upcoming Graded Work" icon={NotebookPen} to="/assignments" actionLabel="View Assignments">
      {upcoming.length === 0 ? (
        <p className="text-parchment-dim text-sm">Nothing due - you're caught up.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {upcoming.map((assignment) => {
            const course = getCourse(assignment.courseId);
            return (
              <p key={assignment.id} className="text-sm truncate">
                <span className="text-parchment-dim">{assignment.dueDate}</span>{" "}
                <span className="text-parchment">{assignment.title}</span>
                {course && <span className="text-parchment-dim"> &middot; {course.name}</span>}
              </p>
            );
          })}
        </div>
      )}
    </DashboardWidget>
  );
}
