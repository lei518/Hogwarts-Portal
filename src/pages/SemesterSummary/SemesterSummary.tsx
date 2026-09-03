import { MessageSquareQuote } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { getSemesterSummary } from "../../utils/grades";
import { ProfileField, ProfileSection } from "../../components/character/ProfileSection";

export function SemesterSummaryPage() {
  const { state } = useGame();
  const { character } = state;

  if (!character) return null;

  const summary = getSemesterSummary(character);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📈 Semester Summary</h1>
        <p className="text-parchment-dim text-sm">{summary.semester} — end-of-term overview.</p>
      </div>

      <section className="border border-parchment-dim/20 rounded-sm px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
        <ProfileField label="Courses Taken" value={String(summary.coursesTaken)} />
        <ProfileField label="Assignments Completed" value={String(summary.assignmentsCompleted)} />
        <ProfileField label="Average Grade" value={summary.averageGrade} />
        <ProfileField label="Academic Standing" value={summary.standing} />
      </section>

      <ProfileSection title="Professor Feedback" icon={MessageSquareQuote}>
        <p className="text-parchment-dim text-sm">{summary.professorFeedback}</p>
      </ProfileSection>
    </div>
  );
}
