import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BookMarked, Mail, Megaphone, ArrowLeft } from "lucide-react";
import type { Professor } from "../../types/resources";
import type { Course } from "../../types/academics";
import { professorsRepository } from "../../repositories/professorsRepository";
import { ProfileSection } from "../../components/character/ProfileSection";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";

// Phase 7A - Live Academic Data. `professor` is a real Supabase account
// (see professorsRepository.ts) - office hours/bio/research interests are
// never fabricated on a real account's behalf, so an unset field reads as
// an honest "this professor hasn't listed one" instead. Courses Taught is
// computed live from
// course_professor_assignments (coursesRepository.getForProfessor), not
// stored here, so the relationship only has one place to drift.
export function ProfessorDetailPage() {
  const { professorId } = useParams<{ professorId: string }>();
  const [professor, setProfessor] = useState<Professor | undefined>(undefined);
  const [coursesTaught, setCoursesTaught] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!professorId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      professorsRepository.getById(professorId),
      professorsRepository.getCoursesForProfessor(professorId),
    ]).then(([foundProfessor, taught]) => {
      if (cancelled) return;
      setProfessor(foundProfessor);
      setCoursesTaught(taught);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [professorId]);

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading professor…" />
      </div>
    );
  }

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

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/professors" className="flex items-center gap-1.5 text-gold hover:text-gold-bright text-xs w-fit">
        <ArrowLeft size={14} />
        Back to Professor Directory
      </Link>

      <Card as="section" className="px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-1">{professor.name}</h1>
        <p className="text-parchment-dim text-sm">{professor.title}</p>
      </Card>

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

        <ProfileSection title="Profile Details" icon={Mail}>
          <p className="text-parchment-dim text-sm">
            This professor hasn't listed office hours, a biography, or research interests here.
          </p>
        </ProfileSection>

        <ProfileSection title="Owlery Contact" icon={Mail}>
          <p className="text-parchment-dim text-sm mb-3">Send a message directly through the Owlery.</p>
          <Link to="/owlery" className="text-gold hover:text-gold-bright text-xs">
            Open your Owlery inbox &rarr;
          </Link>
        </ProfileSection>

        <ProfileSection title="Announcements by this Professor" icon={Megaphone}>
          <p className="text-parchment-dim text-sm">Notices this professor has posted for their students.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
