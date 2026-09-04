import { Link } from "react-router-dom";
import { History, Mail } from "lucide-react";
import { useProfessorScope } from "../../utils/professorScope";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";

// Canonical owner of this professor's Professor Portal identity - separate
// from, but linked to, the existing Resources -> Professor Directory entry
// with the same id (data/professors.ts), which stays the public-facing
// listing. See CLAUDE.md's Professor Portal section.
//
// Authentication Foundation (Phase 6B): `profile` comes from
// useProfessorScope() (in turn from AuthenticatedProfessorContext), the
// signed-in professor's own identity - see that context's comment on how
// it's resolved and what a non-matched professor sees instead.
export function ProfessorProfilePage() {
  const { profile, loading } = useProfessorScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading your profile…" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto text-center">
        <p className="text-parchment-dim text-sm">No profile is available for this session.</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <section className="border border-parchment-dim/20 rounded-sm px-6 py-6">
        <p className="text-parchment-dim text-xs uppercase tracking-[0.2em] mb-1">{profile.department}</p>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-3">{profile.displayName}</h1>
        <p className="text-parchment text-sm leading-relaxed mb-5">{profile.bio}</p>
        <div className="grid grid-cols-2 gap-4">
          <ProfileField label="Title" value={profile.title} />
          <ProfileField label="Office" value={profile.officeLocation} />
          <ProfileField label="Years at Hogwarts" value={profile.yearsAtHogwarts} />
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Teaching History" icon={History}>
          <p className="text-parchment-dim text-sm">
            Past terms and courses taught will appear here once teaching history is tracked.
          </p>
        </ProfileSection>

        <ProfileSection title="Contact via Owl Post" icon={Mail}>
          <p className="text-parchment-dim text-sm">
            Students will be able to reach you here once Owl Post integration is available for the Professor
            Portal.
          </p>
        </ProfileSection>
      </div>

      <Link to={`/professors/${profile.id}`} className="text-gold hover:text-gold-bright text-xs">
        View public listing in the Professor Directory &rarr;
      </Link>
    </div>
  );
}
