import { Link } from "react-router-dom";
import type { Course, AcademicProgressStatus } from "../../types/academics";
import { getProfessor } from "../../data/professors";
import { AcademicStatusBadge } from "./AcademicStatusBadge";

interface CourseCardProps {
  course: Course;
  status: AcademicProgressStatus;
}

export function CourseCard({ course, status }: CourseCardProps) {
  const professor = getProfessor(course.professorId);

  return (
    <Link
      to={`/courses/${course.id}`}
      className="block border border-parchment-dim/20 rounded-sm px-5 py-4 hover:border-gold transition-colors duration-150"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="font-display text-lg text-parchment">{course.name}</p>
        <AcademicStatusBadge status={status} />
      </div>
      <p className="text-parchment-dim text-xs mb-2">
        {professor?.name ?? "Staff vacancy"} &middot; {course.classroom}
      </p>
      <p className="text-parchment-dim text-sm">{course.description}</p>
    </Link>
  );
}
