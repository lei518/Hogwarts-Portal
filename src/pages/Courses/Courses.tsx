import { useGame } from "../../context/GameContext";
import { courses } from "../../data/courses";
import { getCourseStatus } from "../../utils/academics";
import { CourseCard } from "../../components/academics/CourseCard";

export function CoursesPage() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📖 Courses</h1>
      <p className="text-parchment-dim text-sm mb-8">
        Your enrolled courses for Year {character.year}.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} status={getCourseStatus(character, course)} />
        ))}
      </div>
    </div>
  );
}
