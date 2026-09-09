import { Link } from "react-router-dom";
import type { Course, AcademicProgressStatus } from "../../types/academics";
import { AcademicStatusBadge } from "./AcademicStatusBadge";
import { Card } from "../ui/Card";

interface CourseCardProps {
  course: Course;
  status: AcademicProgressStatus;
  // Phase 7A - resolved live from course_professor_assignments by the
  // caller (see AcademicDataContext); undefined/null means "To Be
  // Assigned", never a fabricated professor.
  professorName?: string;
}

export function CourseCard({ course, status, professorName }: CourseCardProps) {
  return (
    <Card interactive className="p-0 overflow-hidden">
      <Link to={`/courses/${course.id}`} className="block px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="font-display text-lg text-parchment">{course.name}</p>
          <AcademicStatusBadge status={status} />
        </div>
        <p className="text-parchment-dim text-xs mb-2">
          {professorName ?? "To Be Assigned"} &middot; {course.classroom}
        </p>
        <p className="text-parchment-dim text-sm">{course.description}</p>
      </Link>
    </Card>
  );
}
