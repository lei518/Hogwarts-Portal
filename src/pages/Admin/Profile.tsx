import { ShieldCheck, ScrollText, UserCog } from "lucide-react";
import { useAdminScope } from "../../utils/adminScope";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";

// Canonical owner of this admin's Admin Portal identity - see
// CLAUDE.md's Admin Portal section. Standalone, unlike ProfessorProfile:
// no matching Resources directory entry exists to cross-reference yet.
//
// Authentication Foundation (Phase 6C): admin comes from useAdminScope()
// (in turn from AuthenticatedAdminContext), the signed-in administrator's
// own identity - see that context's comment on how it's resolved and what
// a non-matched administrator sees instead.
//
// Session Management (Phase 6K): this is the Admin Portal's own
// "user/profile" area, so Sign Out lives here - same signOut() from
// AuthContext as the Student Portal's AccountSection and the Professor
// Portal's Profile page, no separate logout logic.
export function AdminProfilePage() {
  const { profile: admin, loading } = useAdminScope();
  const { signOut } = useAuth();

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
      <PageHeader
        title={admin.displayName}
        description={admin.department}
        icon={UserCog}
        action={
          <Button variant="secondary" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        }
      />

      <Card as="section" className="px-6 py-6">
        <p className="text-parchment text-sm leading-relaxed mb-5">{admin.bio}</p>
        <div className="grid grid-cols-2 gap-4">
          <ProfileField label="Title" value={admin.title} />
          <ProfileField label="Department" value={admin.department} />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Account Security" icon={ShieldCheck}>
          <p className="text-parchment-dim text-sm">Manage your account preferences and privacy settings.</p>
        </ProfileSection>

        <ProfileSection title="Activity Log" icon={ScrollText}>
          <p className="text-parchment-dim text-sm">A running log of this administrator's own actions.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
