import { Users, UserSquare, UserCheck, NotebookPen, ListChecks, Trophy, Activity, ScrollText, Inbox, CalendarClock, Package, Scale, LayoutDashboard, Megaphone } from "lucide-react";
import { useAdminAnalytics } from "../../utils/adminAnalytics";
import { DashboardWidget } from "../../components/dashboard/DashboardWidget";
import { ProfileSection } from "../../components/character/ProfileSection";
import { PageHeader } from "../../components/ui/PageHeader";

// Admin Portal Foundation homepage: summaries only, same "widgets, owns no
// data of its own" rule as every other Dashboard in the portal. Every
// number here comes from useAdminAnalytics(), the one read-only helper
// this whole portal goes through - see CLAUDE.md's Admin Portal section.
export function AdminDashboardPage() {
  const stats = useAdminAnalytics();
  const leader = stats.houseCupStandings[0];

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-5xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Admin Dashboard"
        description="A school-wide overview, computed from existing data."
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardWidget title="Students" icon={Users} to="/admin/students" actionLabel="View Records">
          <p className="text-parchment text-2xl font-display">{stats.studentCount}</p>
        </DashboardWidget>

        <DashboardWidget title="Professors" icon={UserSquare} to="/admin/professors" actionLabel="View Records">
          <p className="text-parchment text-2xl font-display">{stats.professorCount}</p>
        </DashboardWidget>

        <DashboardWidget title="Active Accounts" icon={UserCheck} to="/admin/users" actionLabel="Manage Accounts">
          <p className="text-parchment text-2xl font-display">{stats.activeAccountCount}</p>
        </DashboardWidget>

        <DashboardWidget title="Announcements" icon={Megaphone} to="/admin/announcements" actionLabel="Manage">
          <p className="text-parchment text-2xl font-display mb-1">
            {stats.announcementDraftCount + stats.announcementPublishedCount}
          </p>
          <p className="text-parchment-dim text-xs">
            {stats.announcementPublishedCount} published &middot; {stats.announcementDraftCount} draft
          </p>
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

      <ProfileSection title="Recent Announcements" icon={Megaphone}>
        {stats.recentAnnouncements.length === 0 ? (
          <p className="text-parchment-dim text-sm">No announcements have been created yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="flex items-center justify-between gap-3">
                <p className="text-parchment text-sm truncate">{announcement.title}</p>
                <span
                  className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${
                    announcement.published
                      ? "border-pine/40 text-pine bg-pine/10"
                      : "border-parchment-dim/25 text-parchment-dim"
                  }`}
                >
                  {announcement.published ? "Published" : "Draft"}
                </span>
              </div>
            ))}
          </div>
        )}
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="System Health" icon={Activity}>
          <p className="text-parchment-dim text-sm">An overview of how school systems are performing.</p>
        </ProfileSection>

        <ProfileSection title="Recent Audit Activity" icon={ScrollText}>
          <p className="text-parchment-dim text-sm">A running log of administrative actions across the portal.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
