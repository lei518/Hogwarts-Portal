import { Download, TrendingUp, LineChart } from "lucide-react";
import { useAdminAnalytics } from "../../utils/adminAnalytics";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";
import { PageHeader } from "../../components/ui/PageHeader";

// Pure aggregation over data every other module already owns - useAdminAnalytics
// computes everything below fresh on every render; nothing here is stored,
// so Analytics can never drift out of sync with (or become a second source
// of truth for) Student or Professor Portal data. See CLAUDE.md's Admin
// Portal section.
export function AnalyticsPage() {
  const stats = useAdminAnalytics();

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Analytics"
        description="School-wide numbers, computed from existing data."
        icon={LineChart}
      />

      <ProfileSection title="Directory">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ProfileField label="Students" value={stats.studentCount} />
          <ProfileField label="Professors" value={stats.professorCount} />
        </div>
      </ProfileSection>

      <ProfileSection title="Assignment Management">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ProfileField label="Total Assignments" value={stats.assignmentCount} />
          <ProfileField label="Published" value={stats.publishedAssignmentCount} />
          <ProfileField label="Draft" value={stats.draftAssignmentCount} />
          <ProfileField label="Archived" value={stats.archivedAssignmentCount} />
        </div>
      </ProfileSection>

      <ProfileSection title="Grade Management">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ProfileField label="Pending Reviews" value={stats.pendingReviewCount} />
          <ProfileField label="Reviewed Submissions" value={stats.reviewedSubmissionCount} />
        </div>
      </ProfileSection>

      <ProfileSection title="Admin Operations">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ProfileField label="Active Operations" value={stats.activeAdministrativeOperationsCount} />
          <ProfileField label="Pending Approvals" value={stats.pendingServiceRequestCount} />
          <ProfileField label="Published Drafts" value={stats.publishedCalendarEventCount} />
          <ProfileField
            label="House Point Adjustments"
            value={`${stats.housePointAdjustmentCount} (net ${stats.housePointAdjustmentNetTotal >= 0 ? "+" : ""}${stats.housePointAdjustmentNetTotal})`}
          />
        </div>
        <p className="text-parchment-dim text-xs mt-3">
          Sourced from AdminContext's own local ledgers (Phase 4B) - separate from, and never merged into,
          Character.housePoints or any Student/Professor Portal data.
        </p>
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Export Reports" icon={Download}>
          <p className="text-parchment-dim text-sm">Save these figures for offline review and reporting.</p>
        </ProfileSection>

        <ProfileSection title="Trend Forecasting" icon={TrendingUp}>
          <p className="text-parchment-dim text-sm">See how these numbers are trending across the term.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
