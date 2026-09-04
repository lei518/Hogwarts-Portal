import { ShieldCheck, ScrollText } from "lucide-react";
import { useAdminScope } from "../../utils/adminScope";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";

// Canonical owner of this admin's Admin Portal identity - see
// CLAUDE.md's Admin Portal section. Standalone, unlike ProfessorProfile:
// no matching Resources directory entry exists to cross-reference yet.
//
// Authentication Foundation (Phase 6C): admin comes from useAdminScope()
// (in turn from AuthenticatedAdminContext), the signed-in administrator's
// own identity - see that context's comment on how it's resolved and what
// a non-matched administrator sees instead.
export function AdminProfilePage() {
  const { profile: admin, loading } = useAdminScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading your profile…" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto text-center">
        <p className="text-parchment-dim text-sm">No profile is available for this session.</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <section className="border border-parchment-dim/20 rounded-sm px-6 py-6">
        <p className="text-parchment-dim text-xs uppercase tracking-[0.2em] mb-1">{admin.department}</p>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-3">{admin.displayName}</h1>
        <p className="text-parchment text-sm leading-relaxed mb-5">{admin.bio}</p>
        <div className="grid grid-cols-2 gap-4">
          <ProfileField label="Title" value={admin.title} />
          <ProfileField label="Department" value={admin.department} />
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Security" icon={ShieldCheck}>
          <p className="text-parchment-dim text-sm">
            Two-factor authentication and session management will be available here once real accounts exist.
          </p>
        </ProfileSection>

        <ProfileSection title="Activity Log" icon={ScrollText}>
          <p className="text-parchment-dim text-sm">
            A record of this admin's own actions will be available here in a future milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
