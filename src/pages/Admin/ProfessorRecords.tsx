import { Link } from "react-router-dom";
import { ClipboardList, TrendingUp } from "lucide-react";
import { professors, getCoursesForProfessor } from "../../data/professors";
import { ProfileSection } from "../../components/character/ProfileSection";

// Read-only browse view over Resources' existing Professor Directory
// (data/professors.ts) - Admin Portal owns no professor data of its own.
// "Courses taught" reuses the existing computed getCoursesForProfessor
// rather than a second copy of that relationship.
export function ProfessorRecordsPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🧑‍🏫 Professor Records</h1>
        <p className="text-parchment-dim text-sm">{professors.length} staff on file.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {professors.map((professor) => {
          const courses = getCoursesForProfessor(professor.id);
          return (
            <Link
              key={professor.id}
              to={`/professors/${professor.id}`}
              className="block border border-parchment-dim/20 rounded-sm px-5 py-4 hover:border-gold transition-colors duration-150"
            >
              <p className="font-display text-lg text-parchment mb-1">{professor.name}</p>
              <p className="text-parchment-dim text-xs mb-2">{professor.title}</p>
              <p className="text-parchment-dim text-xs">
                {courses.length === 0
                  ? "No courses on file"
                  : courses.map((course) => course.name).join(", ")}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Teaching Assignments" icon={ClipboardList}>
          <p className="text-parchment-dim text-sm">
            Assigning a professor to a new course or section will be available here in a future milestone.
          </p>
        </ProfileSection>

        <ProfileSection title="Performance Metrics" icon={TrendingUp}>
          <p className="text-parchment-dim text-sm">
            Grading turnaround and student outcomes per professor will appear here in a future milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
