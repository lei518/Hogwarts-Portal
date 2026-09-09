import { Link } from "react-router-dom";
import { Users, HelpCircle, CalendarCheck } from "lucide-react";
import { getCourse } from "../../data/courses";
import { useProfessorScope } from "../../utils/professorScope";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge, type BadgeTone } from "../../components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/Table";
import type { RosterStanding } from "../../types/professorPortal";

const STANDING_TONE: Record<RosterStanding, BadgeTone> = {
  Excelling: "emerald",
  "On Track": "gold",
  "Needs Attention": "maroon",
};

// Read-only view over Student Roster data - grouped by teaching section so
// it mirrors how a professor actually thinks about their students, but this
// page owns nothing: it never dispatches, never reads Character, and the
// roster entries themselves are canonically owned by data/professorPortal.ts.
//
// Authentication Foundation (Phase 6B): teachingCourses/roster come from
// useProfessorScope(), already filtered to the signed-in professor's own
// sections.
export function StudentRosterPage() {
  const { teachingCourses, rosterByTeachingCourseId, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading your roster…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader title="Student Roster" description="Everyone enrolled across your sections." icon={Users} />

      {teachingCourses.length === 0 && (
        <EmptyState message="No students assigned." icon={Users} />
      )}

      {teachingCourses.map((teachingCourse) => {
        const course = getCourse(teachingCourse.courseId);
        const roster = rosterByTeachingCourseId.get(teachingCourse.id) ?? [];
        return (
          <ProfileSection
            key={teachingCourse.id}
            title={`${course?.name ?? teachingCourse.courseId} — ${teachingCourse.section}`}
            icon={Users}
          >
            {roster.length === 0 ? (
              <p className="text-parchment-dim text-sm">No students assigned to this section yet.</p>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Student</Th>
                    <Th>House</Th>
                    <Th>Year</Th>
                    <Th>Standing</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {roster.map((entry) => (
                    <Tr key={entry.id}>
                      <Td>
                        {entry.studentName}
                        {entry.attendanceNote && (
                          <p className="text-parchment-dim text-xs mt-0.5 font-normal">{entry.attendanceNote}</p>
                        )}
                      </Td>
                      <Td className="text-parchment-dim">{entry.house}</Td>
                      <Td className="text-parchment-dim">{entry.year}</Td>
                      <Td>
                        {entry.standing ? (
                          <Badge tone={STANDING_TONE[entry.standing]}>{entry.standing}</Badge>
                        ) : (
                          <span className="text-parchment-dim text-xs">Not yet assessed</span>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </ProfileSection>
        );
      })}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Student Messages" icon={HelpCircle}>
          <p className="text-parchment-dim text-sm mb-3">Questions your students send arrive in the Owlery.</p>
          <Link to="/professor/owlery" className="text-gold hover:text-gold-bright text-xs">
            Open your Owlery inbox &rarr;
          </Link>
        </ProfileSection>

        <ProfileSection title="Attendance Records" icon={CalendarCheck}>
          <p className="text-parchment-dim text-sm">A per-lesson record of who was present in each class.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
