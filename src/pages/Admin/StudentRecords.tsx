import { Link } from "react-router-dom";
import { ClipboardList, ShieldAlert, GraduationCap } from "lucide-react";
import { useAdminScope } from "../../utils/adminScope";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge, type BadgeTone } from "../../components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from "../../components/ui/Table";
import type { AccountStatus } from "../../types/adminPortal";

const STATUS_TONE: Record<AccountStatus, BadgeTone> = {
  Active: "emerald",
  Suspended: "maroon",
  Locked: "neutral",
  Pending: "gold",
};

// Real Account Records (Phase 6J). Used to browse Resources' seeded
// Student Directory (data/students.ts) - now instead reflects the real
// student accounts already loaded by AdminContext, the same one place
// User Administration reads from. Admin Portal still owns no student data
// of its own; this is a read-only, role-filtered view over
// useAdminScope()'s `accounts`, not a second source of truth. A real
// account has no house/year on file (those live only on the seeded
// Character/Student model this page no longer reads), so those fields
// show an honest placeholder rather than a fabricated value. Links out to
// the Student Portal's own profile page only when a seeded record has
// actually been linked (`linkedStudentId`) - true for none of today's
// real accounts, reserved for when that linkage exists.
export function StudentRecordsPage() {
  const { accounts, accountsError, loading } = useAdminScope();
  const students = accounts.filter((account) => account.role === "student");

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading student records…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Student Records"
        description={`${students.length} students on file.`}
        icon={GraduationCap}
      />

      {accountsError && <p className="text-ember text-xs">{accountsError}</p>}

      {students.length === 0 ? (
        <EmptyState message="No student accounts on file yet." icon={GraduationCap} />
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>House</Th>
              <Th>Year</Th>
            </Tr>
          </Thead>
          <Tbody>
            {students.map((account) => (
              <Tr key={account.id} interactive={!!account.linkedStudentId}>
                <Td>
                  {account.linkedStudentId ? (
                    <Link
                      to={`/students/${account.linkedStudentId}`}
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
            {students.length === 0 && <TableEmptyRow colSpan={4}>No student accounts on file yet.</TableEmptyRow>}
          </Tbody>
        </Table>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Enrollment Actions" icon={ClipboardList}>
          <p className="text-parchment-dim text-sm">Enroll, transfer, or withdraw a student from the school roll.</p>
        </ProfileSection>

        <ProfileSection title="Academic Holds" icon={ShieldAlert}>
          <p className="text-parchment-dim text-sm">Place or lift an administrative hold on a student's record.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
