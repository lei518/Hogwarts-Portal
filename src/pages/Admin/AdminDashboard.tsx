import { Users, UserSquare, NotebookPen, ListChecks, Trophy, Activity, ScrollText, Inbox, CalendarClock, Package, Scale } from "lucide-react";
import { useAdminAnalytics } from "../../utils/adminAnalytics";
import { DashboardWidget } from "../../components/dashboard/DashboardWidget";
import { ProfileSection } from "../../components/character/ProfileSection";

// Admin Portal Foundation homepage: summaries only, same "widgets, owns no
// data of its own" rule as every other Dashboard in the portal. Every
// number here comes from useAdminAnalytics(), the one read-only helper
// this whole portal goes through - see CLAUDE.md's Admin Portal section.
export function AdminDashboardPage() {
  const stats = useAdminAnalytics();
  const leader = stats.houseCupStandings[0];

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-1">🏛️ Admin Dashboard</h1>
        <p className="text-parchment-dim text-sm">A school-wide overview, computed from existing data.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardWidget title="Students" icon={Users} to="/admin/students" actionLabel="View Records">
          <p className="text-parchment text-2xl font-display">{stats.studentCount}</p>
        </DashboardWidget>

        <DashboardWidget title="Professors" icon={UserSquare} to="/admin/professors" actionLabel="View Records">
          <p className="text-parchment text-2xl font-display">{stats.professorCount}</p>
        </DashboardWidget>

        <DashboardWidget title="Assignments" icon={NotebookPen}>
          <p className="text-parchment text-2xl font-display mb-1">{stats.assignmentCount}</p>
          <p className="text-parchment-dim text-xs">
            {stats.publishedAssignmentCount} published &middot; {stats.draftAssignmentCount} draft &middot;{" "}
            {stats.archivedAssignmentCount} archived
          </p>
        </DashboardWidget>

        <DashboardWidget title="Pending Reviews" icon={ListChecks}>
          <p className="text-parchment text-2xl font-display">{stats.pendingReviewCount}</p>
        </DashboardWidget>

        <DashboardWidget title="House Cup Leader" icon={Trophy} to="/admin/house-cup" actionLabel="View Standings">
          {leader ? (
            <p className="text-parchment text-lg font-display">
              {leader.house} &middot; {leader.points} pts
            </p>
          ) : (
            <p className="text-parchment-dim text-sm">No active Character session.</p>
          )}
        </DashboardWidget>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardWidget title="Pending Service Requests" icon={Inbox} to="/admin/services" actionLabel="Review">
          <p className="text-parchment text-2xl font-display">{stats.pendingServiceRequestCount}</p>
        </DashboardWidget>

        <DashboardWidget title="Draft Calendar Events" icon={CalendarClock} to="/admin/calendar" actionLabel="Review">
          <p className="text-parchment text-2xl font-display">{stats.draftCalendarEventCount}</p>
        </DashboardWidget>

        <DashboardWidget title="Outstanding Resource Requests" icon={Package} to="/admin/resources" actionLabel="Review">
          <p className="text-parchment text-2xl font-display">{stats.outstandingResourceRequestCount}</p>
        </DashboardWidget>

        <DashboardWidget title="House Point Adjustments Awaiting Review" icon={Scale} to="/admin/house-cup" actionLabel="Review">
          <p className="text-parchment text-2xl font-display">{stats.housePointAdjustmentsAwaitingReviewCount}</p>
        </DashboardWidget>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="System Health" icon={Activity}>
          <p className="text-parchment-dim text-sm">
            Uptime and error monitoring will appear here once there's a real backend to monitor.
          </p>
        </ProfileSection>

        <ProfileSection title="Recent Audit Activity" icon={ScrollText}>
          <p className="text-parchment-dim text-sm">
            A log of administrative actions will appear here once User Administration supports taking any.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
