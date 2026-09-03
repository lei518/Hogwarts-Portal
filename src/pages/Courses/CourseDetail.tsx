import { useParams, Link } from "react-router-dom";
import { Sparkles, CalendarClock, Mail, BookOpen, ClipboardList } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { getCourse } from "../../data/courses";
import { getProfessor } from "../../data/professors";
import { getBook } from "../../data/books";
import { getAssignmentsForCourse } from "../../data/assignments";
import { getCourseStatus } from "../../utils/academics";
import { AcademicStatusBadge } from "../../components/academics/AcademicStatusBadge";
import { AssignmentStatusBadge } from "../../components/academics/AssignmentStatusBadge";
import { ProfileSection } from "../../components/character/ProfileSection";
import type { AssignmentStatus } from "../../types/academics";

// Every course already routes here (see CourseCard), so this page is the
// natural home for the fields CLAUDE.md earmarks as "eventually": Related
// Spells, Upcoming Lessons, and Related Owl Post each get a reserved,
// clearly-future section below rather than being bolted on later.
export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { state } = useGame();
  const { character } = state;

  const course = courseId ? getCourse(courseId) : undefined;

  if (!character) return null;

  if (!course) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-display text-gold-bright mb-2">Course Not Found</h1>
        <Link to="/courses" className="text-gold hover:text-gold-bright text-sm">
          &larr; Back to Courses
        </Link>
      </div>
    );
  }

  const status = getCourseStatus(character, course);
  const professor = getProfessor(course.professorId);
  const recommendedBooks = (course.recommendedBookIds ?? [])
    .map((id) => getBook(id))
    .filter((book) => book !== undefined);
  const assignments = getAssignmentsForCourse(course.id);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/courses" className="text-gold hover:text-gold-bright text-xs">
        &larr; Back to Courses
      </Link>

      <section className="border border-parchment-dim/20 rounded-sm px-6 py-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl md:text-3xl font-display text-gold-bright">{course.name}</h1>
          <AcademicStatusBadge status={status} />
        </div>
        <p className="text-parchment-dim text-sm mb-4">
          {professor ? (
            <Link to={`/professors/${professor.id}`} className="text-gold hover:text-gold-bright">
              {professor.name}
            </Link>
          ) : (
            "Staff vacancy"
          )}{" "}
          &middot; {course.classroom} &middot; Required Year {course.requiredYear}
        </p>
        <p className="text-parchment text-sm leading-relaxed">{course.description}</p>
      </section>

      {recommendedBooks.length > 0 && (
        <ProfileSection title="Recommended Resources" icon={BookOpen}>
          <div className="flex flex-wrap gap-2">
            {recommendedBooks.map((book) => (
              <Link
                key={book!.id}
                to="/library"
                className="text-xs border border-parchment-dim/25 rounded-full px-3 py-1 text-parchment hover:border-gold hover:text-gold-bright transition-colors"
              >
                {book!.title}
              </Link>
            ))}
          </div>
        </ProfileSection>
      )}

      {assignments.length > 0 && (
        <ProfileSection title="Assignments" icon={ClipboardList}>
          <div className="flex flex-col gap-2">
            {assignments.map((assignment) => {
              const status: AssignmentStatus =
                character.assignmentSubmissions[assignment.id]?.status ?? "Not Started";
              return (
                <Link
                  key={assignment.id}
                  to={`/assignments/${assignment.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:text-gold-bright transition-colors"
                >
                  <span className="text-parchment">{assignment.title}</span>
                  <AssignmentStatusBadge status={status} />
                </Link>
              );
            })}
          </div>
        </ProfileSection>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ProfileSection title="Related Spells" icon={Sparkles}>
          <p className="text-parchment-dim text-sm">
            Related spells will appear here once course content links into the Spellbook.
          </p>
        </ProfileSection>

        <ProfileSection title="Upcoming Lessons" icon={CalendarClock}>
          <p className="text-parchment-dim text-sm">
            A lesson-by-lesson plan for this course isn't available yet.
          </p>
        </ProfileSection>

        <ProfileSection title="Related Owl Post" icon={Mail}>
          <p className="text-parchment-dim text-sm">
            Messages from {professor?.name ?? "your professor"} will appear here once course-linked Owl
            Post is available.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
