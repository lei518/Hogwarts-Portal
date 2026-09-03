import { Link } from "react-router-dom";
import { useGame } from "../../context/GameContext";
import { grades } from "../../data/grades";
import { getCourse } from "../../data/courses";
import { getProfessor } from "../../data/professors";

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "#c9a646",
  Completed: "#6b9e6b",
  Incomplete: "#8a8478",
};

export function GradesPage() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const rows = grades
    .filter((grade) => {
      const course = getCourse(grade.courseId);
      return course ? course.requiredYear <= character.year : false;
    })
    .map((grade) => ({ grade, course: getCourse(grade.courseId) }));

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📊 Grades</h1>
      <p className="text-parchment-dim text-sm mb-2">Your current standing in each enrolled course.</p>
      <p className="text-parchment-dim text-xs mb-8">
        Sample grades - professors can't submit real grades until a Professor Portal exists.
      </p>

      <div className="flex flex-col gap-2">
        {rows.map(({ grade, course }) => (
          <div key={grade.id} className="border border-parchment-dim/20 rounded-sm px-5 py-4">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="min-w-0">
                <Link
                  to={course ? `/courses/${course.id}` : "/courses"}
                  className="font-display text-lg text-parchment hover:text-gold-bright transition-colors"
                >
                  {course?.name ?? grade.courseId}
                </Link>
                <p className="text-parchment-dim text-xs">
                  {course ? getProfessor(course.professorId)?.name ?? "Staff vacancy" : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-xl text-gold-bright">{grade.currentGrade}</p>
                <span
                  className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                  style={{
                    color: STATUS_COLORS[grade.status],
                    borderColor: `${STATUS_COLORS[grade.status]}66`,
                    background: `${STATUS_COLORS[grade.status]}15`,
                  }}
                >
                  {grade.status}
                </span>
              </div>
            </div>
            <p className="text-parchment-dim text-sm mt-2">{grade.remarks}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
