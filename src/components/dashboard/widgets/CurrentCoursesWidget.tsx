import { BookOpen } from "lucide-react";
import { useGame } from "../../../context/GameContext";
import { useAcademicData } from "../../../context/AcademicDataContext";
import { DashboardWidget } from "../DashboardWidget";

// Preview of Academics -> Courses, per CLAUDE.md's Home-previews-Academics-
// manages rule. Phase 7A - courses/professor names are live (see
// AcademicDataContext); "To Be Assigned" is an honest state, never a
// fabricated professor.
export function CurrentCoursesWidget() {
  const { state } = useGame();
  const { character } = state;
  const { courses, professorsById } = useAcademicData();

  if (!character) return null;

  const currentCourses = courses.filter((course) => course.requiredYear <= character.year);

  return (
    <DashboardWidget title="Current Courses" icon={BookOpen} to="/courses" actionLabel="View Courses">
      {currentCourses.length === 0 ? (
        <p className="text-parchment-dim text-sm">No courses assigned.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {currentCourses.slice(0, 4).map((course) => (
            <p key={course.id} className="text-sm truncate">
              <span className="text-parchment">{course.name}</span>{" "}
              <span className="text-parchment-dim">
                &middot; {course.professorId ? (professorsById.get(course.professorId)?.name ?? "To Be Assigned") : "To Be Assigned"}
              </span>
            </p>
          ))}
        </div>
      )}
    </DashboardWidget>
  );
}
