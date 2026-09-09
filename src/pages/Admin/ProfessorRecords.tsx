import { Link } from "react-router-dom";
import { ClipboardList, TrendingUp, BookUser } from "lucide-react";
import { useAdminScope } from "../../utils/adminScope";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge, type BadgeTone } from "../../components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/Table";
import type { AccountStatus } from "../../types/adminPortal";

const STATUS_TONE: Record<AccountStatus, BadgeTone> = {
  Active: "emerald",
  Suspended: "maroon",
  Locked: "neutral",
  Pending: "gold",
};

// Real Account Records (Phase 6J). Used to browse Resources' seeded
// Professor Directory (data/professors.ts) - now instead reflects the
// real professor accounts already loaded by AdminContext, the same one
// place User Administration reads from. Admin Portal still owns no
// professor data of its own; this is a read-only, role-filtered view over
// useAdminScope()'s `accounts`, not a second source of truth. A real
// account has no title/courses-taught on file (those live only on the
// seeded Professor/TeachingCourse model this page no longer reads), so
// those fields show an honest placeholder rather than a fabricated value.
// Links out to the Professor Directory's own profile page only when a
// seeded record has actually been linked (`linkedProfessorId`) - true for
// none of today's real accounts, reserved for when that linkage exists.
export function ProfessorRecordsPage() {
  const { accounts, accountsError, loading } = useAdminScope();
  const professorAccounts = accounts.filter((account) => account.role === "professor");

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading professor records…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Professor Records"
        description={`${professorAccounts.length} staff on file.`}
        icon={BookUser}
      />

      {accountsError && <p className="text-ember text-xs">{accountsError}</p>}

      {professorAccounts.length === 0 ? (
        <EmptyState message="No professor accounts on file yet." icon={BookUser} />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Title</Th>
              <Th>Teaching Assignment</Th>
            </Tr>
          </Thead>
          <Tbody>
            {professorAccounts.map((account) => (
              <Tr key={account.id} interactive={!!account.linkedProfessorId}>
                <Td>
                  {account.linkedProfessorId ? (
                    <Link
                      to={`/professors/${account.linkedProfessorId}`}
                      className="text-parchment hover:text-gold-bright transition-colors"
                    >
                      {account.displayName}
                    </Link>
                  ) : (
                    account.displayName
                  )}
                </Td>
                <Td>
                  <Badge tone={STATUS_TONE[account.status]}>{account.status}</Badge>
                </Td>
                <Td className="text-parchment-dim">Not yet assigned</Td>
                <Td className="text-parchment-dim">Not yet assigned</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Teaching Assignments" icon={ClipboardList}>
          <p className="text-parchment-dim text-sm">Assign a professor to a new course or section.</p>
        </ProfileSection>

        <ProfileSection title="Performance Metrics" icon={TrendingUp}>
          <p className="text-parchment-dim text-sm">Grading turnaround and student outcomes, by professor.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
