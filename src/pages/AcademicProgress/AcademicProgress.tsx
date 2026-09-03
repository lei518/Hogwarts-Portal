import { Link } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import { courses } from "../../data/courses";
import { getProfessor } from "../../data/professors";
import { getCourseStatus } from "../../utils/academics";
import { AcademicStatusBadge } from "../../components/academics/AcademicStatusBadge";
import type { AcademicProgressStatus } from "../../types/academics";

const STATUS_ORDER: AcademicProgressStatus[] = ["In Progress", "Not Started", "Completed"];

export function AcademicProgressPage() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    courses: courses.filter((course) => getCourseStatus(character, course) === status),
  })).filter((group) => group.courses.length > 0);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📈 Academic Progress</h1>
      <p className="text-parchment-dim text-sm mb-8">
        Where you stand in each course. Grades, attendance, and assignments will appear here
        once those systems are built.
      </p>

      <div className="flex flex-col gap-6">
        {byStatus.map((group) => (
          <div key={group.status}>
            <p className="text-parchment-dim text-xs uppercase tracking-[0.2em] mb-3">
              {group.status} &middot; {group.courses.length}
            </p>
            <div className="flex flex-col gap-2">
              {group.courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="flex items-center justify-between gap-3 border border-parchment-dim/20 rounded-sm px-4 py-3 hover:border-gold transition-colors duration-150"
                >
                  <div className="min-w-0">
                    <p className="font-display text-parchment truncate">{course.name}</p>
                    <p className="text-parchment-dim text-xs truncate">
                      {getProfessor(course.professorId)?.name ?? "Staff vacancy"}
                    </p>
                  </div>
                  <AcademicStatusBadge status={group.status} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
