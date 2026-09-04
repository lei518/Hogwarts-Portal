import { CalendarClock, Repeat } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";

// Canonical owner of this professor's office schedule - see CLAUDE.md's
// Professor Portal section.
//
// Authentication Foundation (Phase 6B): hours come from useProfessorScope(),
// already filtered to the signed-in professor.
export function OfficeHoursPage() {
  const { officeHours: hours, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading your office hours…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🕰️ Office Hours</h1>
        <p className="text-parchment-dim text-sm">When and where students can find you.</p>
      </div>

      <div className="flex flex-col gap-2">
        {hours.length === 0 ? (
          <p className="text-parchment-dim text-sm">No office hours scheduled.</p>
        ) : (
          hours.map((hour) => (
            <div key={hour.id} className="border border-parchment-dim/20 rounded-sm px-5 py-4">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="font-display text-lg text-parchment">{hour.day}</p>
                <p className="text-parchment-dim text-sm">
                  {hour.startTime} – {hour.endTime}
                </p>
              </div>
              <p className="text-parchment-dim text-sm mb-1">{hour.location}</p>
              {hour.note && <p className="text-parchment-dim text-xs">{hour.note}</p>}
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Student Booking Requests" icon={CalendarClock}>
          <p className="text-parchment-dim text-sm">
            Students will be able to request a specific slot here once appointment booking is available.
          </p>
        </ProfileSection>

        <ProfileSection title="Recurring Schedule Templates" icon={Repeat}>
          <p className="text-parchment-dim text-sm">
            Saving a weekly template instead of re-entering the same hours each term will be available here in
            a future milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
