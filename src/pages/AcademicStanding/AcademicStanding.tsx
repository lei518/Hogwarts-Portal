import { useGame } from "../../context/GameContext";
import { getAcademicStanding } from "../../utils/grades";
import { ProfileField } from "../../components/character/ProfileSection";

const STANDING_COLORS: Record<string, string> = {
  "Good Standing": "#6b9e6b",
  "Honor Roll": "#c9a646",
  Probation: "#c77b7b",
  "Not Yet Determined": "#8a8478",
};

export function AcademicStandingPage() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const standing = getAcademicStanding(character);
  const color = STANDING_COLORS[standing.standing];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🛡️ Academic Standing</h1>

      <section
        className="border rounded-sm px-6 py-6 flex items-center justify-between"
        style={{ borderColor: `${color}55`, background: `${color}10` }}
      >
        <div>
          <p className="text-parchment-dim text-xs uppercase tracking-[0.2em] mb-1">Current Standing</p>
          <p className="text-2xl font-display" style={{ color }}>
            {standing.standing}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="border border-parchment-dim/20 rounded-sm px-5 py-4">
          <ProfileField label="GPA" value={standing.gpa} />
        </div>
        <div className="border border-parchment-dim/20 rounded-sm px-5 py-4">
          <ProfileField label="Credits Earned" value={standing.creditsEarned} />
        </div>
        <div className="border border-parchment-dim/20 rounded-sm px-5 py-4">
          <ProfileField label="Courses Completed" value={String(standing.coursesCompleted)} />
        </div>
        <div className="border border-parchment-dim/20 rounded-sm px-5 py-4">
          <ProfileField label="Courses In Progress" value={String(standing.coursesInProgress)} />
        </div>
        <div className="border border-parchment-dim/20 rounded-sm px-5 py-4">
          <ProfileField label="Assignments Submitted" value={String(standing.assignmentsSubmitted)} />
        </div>
        <div className="border border-parchment-dim/20 rounded-sm px-5 py-4">
          <ProfileField
            label="House Points Earned"
            value={`+${standing.housePointsEarnedThroughAcademics}`}
          />
        </div>
      </div>
    </div>
  );
}
