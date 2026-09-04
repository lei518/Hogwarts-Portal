import { Users, HelpCircle, CalendarCheck } from "lucide-react";
import { getCourse } from "../../data/courses";
import { useProfessorScope } from "../../utils/professorScope";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import type { RosterStanding } from "../../types/professorPortal";

const STANDING_COLORS: Record<RosterStanding, string> = {
  Excelling: "#6b9e6b",
  "On Track": "#c9a646",
  "Needs Attention": "#c77b7b",
};

function StandingBadge({ standing }: { standing: RosterStanding }) {
  const color = STANDING_COLORS[standing];
  return (
    <span
      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
      style={{ color, borderColor: `${color}66`, background: `${color}15` }}
    >
      {standing}
    </span>
  );
}

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
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🎓 Student Roster</h1>
        <p className="text-parchment-dim text-sm">Everyone enrolled across your sections.</p>
      </div>

      {teachingCourses.length === 0 && (
        <p className="text-parchment-dim text-sm border border-parchment-dim/15 rounded-sm px-5 py-8 text-center">
          No students assigned.
        </p>
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
              <div className="flex flex-col gap-2">
                {roster.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-3 text-sm border-b border-parchment-dim/10 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-parchment">{entry.studentName}</p>
                      <p className="text-parchment-dim text-xs">
                        {entry.house} &middot; Year {entry.year}
                      </p>
                      {entry.attendanceNote && (
                        <p className="text-parchment-dim text-xs mt-1">{entry.attendanceNote}</p>
                      )}
                    </div>
                    <StandingBadge standing={entry.standing} />
                  </div>
                ))}
              </div>
            )}
          </ProfileSection>
        );
      })}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Pending Student Questions" icon={HelpCircle}>
          <p className="text-parchment-dim text-sm">
            Questions students send you will appear here once Owl Post integration is available for the
            Professor Portal.
          </p>
        </ProfileSection>

        <ProfileSection title="Attendance Records" icon={CalendarCheck}>
          <p className="text-parchment-dim text-sm">
            Per-lesson attendance tracking will live here once that data is captured.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
