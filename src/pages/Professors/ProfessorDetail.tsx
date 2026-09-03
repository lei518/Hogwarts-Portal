import { useParams, Link } from "react-router-dom";
import { BookMarked, Clock, MapPin, FlaskConical, Mail, Megaphone } from "lucide-react";
import { getProfessor, getCoursesForProfessor } from "../../data/professors";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";

// Courses Taught is computed from Course.professorId (see data/professors.ts)
// rather than stored here, so the relationship only has one place to drift.
// Owl Post Contact and Announcements by this Professor are reserved,
// not-yet-built sections - the same pattern CourseDetail.tsx uses.
export function ProfessorDetailPage() {
  const { professorId } = useParams<{ professorId: string }>();
  const professor = professorId ? getProfessor(professorId) : undefined;

  if (!professor) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-display text-gold-bright mb-2">Professor Not Found</h1>
        <Link to="/professors" className="text-gold hover:text-gold-bright text-sm">
          &larr; Back to Professor Directory
        </Link>
      </div>
    );
  }

  const coursesTaught = getCoursesForProfessor(professor.id);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/professors" className="text-gold hover:text-gold-bright text-xs">
        &larr; Back to Professor Directory
      </Link>

      <section className="border border-parchment-dim/20 rounded-sm px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-1">{professor.name}</h1>
        <p className="text-parchment-dim text-sm mb-4">{professor.title}</p>
        <p className="text-parchment text-sm leading-relaxed mb-5">{professor.bio}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField
            label="Office Location"
            value={
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-parchment-dim" /> {professor.officeLocation}
              </span>
            }
          />
          <ProfileField
            label="Office Hours"
            value={
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-parchment-dim" /> {professor.officeHours}
              </span>
            }
          />
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Courses Taught" icon={BookMarked}>
          {coursesTaught.length === 0 ? (
            <p className="text-parchment-dim text-sm">Not currently teaching a listed course.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {coursesTaught.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="text-sm text-parchment hover:text-gold-bright transition-colors"
                >
                  {course.name}
                </Link>
              ))}
            </div>
          )}
        </ProfileSection>

        {professor.researchInterests && professor.researchInterests.length > 0 && (
          <ProfileSection title="Research Interests" icon={FlaskConical}>
            <div className="flex flex-wrap gap-2">
              {professor.researchInterests.map((interest) => (
                <span
                  key={interest}
                  className="text-xs border border-parchment-dim/25 rounded-full px-3 py-1 text-parchment-dim"
                >
                  {interest}
                </span>
              ))}
            </div>
          </ProfileSection>
        )}

        <ProfileSection title="Owl Post Contact" icon={Mail}>
          <p className="text-parchment-dim text-sm">
            Sending Owl Post directly to a professor isn't available yet.
          </p>
        </ProfileSection>

        <ProfileSection title="Announcements by this Professor" icon={Megaphone}>
          <p className="text-parchment-dim text-sm">
            Announcements filtered by professor aren't available yet.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
