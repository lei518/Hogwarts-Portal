import { Settings as SettingsIcon } from "lucide-react";
import { AccountSection } from "../../components/settings/AccountSection";
import { PageHeader } from "../../components/ui/PageHeader";

// University Portal Pivot (Phase 6N): this is now purely an Account &
// Security page - no sound/music toggles, no save/load/reset controls, no
// game-flavored preferences. The app is a real Supabase-backed university
// portal; AccountSection owns the whole page's content (read-only account
// info, a real password change, and Sign Out) and is shared verbatim with
// the Professor Portal's own Profile page.
export function SettingsPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your account, security, and session."
        icon={SettingsIcon}
      />
      <div className="mt-6">
        <AccountSection />
      </div>
    </div>
  );
}
