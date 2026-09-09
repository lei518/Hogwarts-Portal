import { BookOpen } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { useAcademicData } from "../../context/AcademicDataContext";
import { getCourseStatus } from "../../utils/academics";
import { CourseCard } from "../../components/academics/CourseCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { LoadingState } from "../../components/ui/LoadingState";
import { EmptyState } from "../../components/ui/EmptyState";

export function CoursesPage() {
  const { state } = useGame();
  const { character } = state;
  const { courses, professorsById, loading } = useAcademicData();

  if (!character) return null;

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading your courses…" />
      </div>
    );
  }

  const eligibleCourses = courses.filter((course) => course.requiredYear <= character.year);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-8">
      <PageHeader
        title="Courses"
        description={`Your enrolled courses for Year ${character.year}.`}
        icon={BookOpen}
      />

      {eligibleCourses.length === 0 ? (
        <EmptyState message="No courses assigned." icon={BookOpen} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {eligibleCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              status={getCourseStatus(character, course)}
              professorName={course.professorId ? professorsById.get(course.professorId)?.name : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
