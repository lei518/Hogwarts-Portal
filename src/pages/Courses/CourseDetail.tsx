import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, CalendarClock, Mail, BookOpen, ClipboardList } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { useAcademicData } from "../../context/AcademicDataContext";
import { getBook } from "../../data/books";
import { getAssignmentsForCourse } from "../../data/assignments";
import { getCourseStatus } from "../../utils/academics";
import { LoadingState } from "../../components/ui/LoadingState";
import { AcademicStatusBadge } from "../../components/academics/AcademicStatusBadge";
import { AssignmentStatusBadge } from "../../components/academics/AssignmentStatusBadge";
import { ProfileSection } from "../../components/character/ProfileSection";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import type { AssignmentDisplayStatus } from "../../types/academics";

// Every course already routes here (see CourseCard), so this page is the
// natural home for the fields CLAUDE.md earmarks as "eventually": Related
// Spells, Upcoming Lessons, and Related Owl Post each get a reserved,
// clearly-future section below rather than being bolted on later.
export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { state } = useGame();
  const { character } = state;
  const { coursesById, professorsById, submissions, loading } = useAcademicData();

  const course = courseId ? coursesById.get(courseId) : undefined;

  if (!character) return null;

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading course…" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <EmptyState
          message="This course could not be found."
          icon={BookOpen}
          action={
            <Link to="/courses" className="text-gold hover:text-gold-bright text-sm">
              &larr; Back to Courses
            </Link>
          }
        />
      </div>
    );
  }

  const status = getCourseStatus(character, course);
  const professor = course.professorId ? professorsById.get(course.professorId) : undefined;
  const recommendedBooks = (course.recommendedBookIds ?? [])
    .map((id) => getBook(id))
    .filter((book) => book !== undefined);
  const assignments = getAssignmentsForCourse(course.id);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1 text-gold hover:text-gold-bright text-xs w-fit"
      >
        <ArrowLeft size={14} /> Back to Courses
      </Link>

      <Card as="section" className="px-6 py-6">
        <PageHeader title={course.name} icon={BookOpen} action={<AcademicStatusBadge status={status} />} />
        <p className="text-parchment-dim text-sm mt-4 mb-4">
          {professor ? (
            <Link to={`/professors/${professor.id}`} className="text-gold hover:text-gold-bright">
              {professor.name}
            </Link>
          ) : (
            "To Be Assigned"
          )}{" "}
          &middot; {course.classroom} &middot; Required Year {course.requiredYear}
        </p>
        <p className="text-parchment text-sm leading-relaxed">{course.description}</p>
      </Card>

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
              const submission = submissions.find((s) => s.assignmentId === assignment.id);
              const status: AssignmentDisplayStatus = submission?.status ?? "Not Submitted";
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
          <p className="text-parchment-dim text-sm">Spells taught in this course, drawn from the Spellbook.</p>
        </ProfileSection>

        <ProfileSection title="Upcoming Lessons" icon={CalendarClock}>
          <p className="text-parchment-dim text-sm">The week-by-week plan for this course.</p>
        </ProfileSection>

        <ProfileSection title="Messages from Your Professor" icon={Mail}>
          <p className="text-parchment-dim text-sm mb-3">
            Reach {professor?.name ?? "your professor"} directly through the Owlery.
          </p>
          <Link to="/owlery" className="text-gold hover:text-gold-bright text-xs">
            Open your Owlery inbox &rarr;
          </Link>
        </ProfileSection>
      </div>
    </div>
  );
}
