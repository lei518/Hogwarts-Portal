import { useGame } from "../../../context/GameContext";
import { useAcademicData } from "../../../context/AcademicDataContext";
import { getUpcomingAssignments } from "../../../utils/academics";
import { getCourse } from "../../../data/courses";
import { DashboardWidget } from "../DashboardWidget";
import { NotebookPen } from "lucide-react";

// Phase 7A - getUpcomingAssignments reads data/assignments.ts's live,
// Supabase-backed cache (see that file's own comment); depending on
// useAcademicData() here just so this widget re-renders once that live
// fetch resolves, rather than only on whatever else re-renders Home first.
export function UpcomingGradedWorkWidget() {
  const { state } = useGame();
  const { character } = state;
  useAcademicData();

  if (!character) return null;

  const upcoming = getUpcomingAssignments(character, 3);

  return (
    <DashboardWidget title="Upcoming Assignments" icon={NotebookPen} to="/assignments" actionLabel="View Assignments">
      {upcoming.length === 0 ? (
        <p className="text-parchment-dim text-sm">No assignments yet.</p>
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
