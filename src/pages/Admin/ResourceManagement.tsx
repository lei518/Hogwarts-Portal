import { Package } from "lucide-react";
import { books, bookCategories } from "../../data/books";
import { policies, policyCategories } from "../../data/policies";
import { useAdminScope } from "../../utils/adminScope";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge, type BadgeTone } from "../../components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from "../../components/ui/Table";
import type { ResourceRequestStatus } from "../../types/adminPortal";

const STATUS_TONE: Record<ResourceRequestStatus, BadgeTone> = {
  Pending: "gold",
  Ordered: "sapphire",
  Delivered: "emerald",
  Archived: "neutral",
};

// A request moves forward one stage at a time - the same "no skipping
// ahead" shape as Assignment Management's Draft -> Published -> Archived
// workflow.
const NEXT_STATUS: Record<ResourceRequestStatus, ResourceRequestStatus | null> = {
  Pending: "Ordered",
  Ordered: "Delivered",
  Delivered: "Archived",
  Archived: null,
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Top two sections remain a review of Resources' existing Library catalog
// (data/books.ts) and School Policies (data/policies.ts) - Admin Portal
// owns neither. Procurement below is a separate, local-only workflow
// (AdminContext.resourceRequests) over purely administrative requests, not
// over the catalog/policies themselves.
// Authentication Foundation (Phase 6C): routed through useAdminScope(),
// the single hook every Admin page uses - resource requests are still
// shared/global (unchanged).
export function ResourceManagementPage() {
  const { resourceRequests, setResourceRequestStatus, loading } = useAdminScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading resource requests…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Resource Management"
        description="A review of the Library catalog and School Policies."
        icon={Package}
      />

      <ProfileSection title={`Library Catalog · ${books.length} titles`}>
        <div className="flex flex-wrap gap-2">
          {bookCategories.map((category) => {
            const count = books.filter((book) => book.category === category).length;
            if (count === 0) return null;
            return (
              <Badge key={category}>
                {category} &middot; {count}
              </Badge>
            );
          })}
        </div>
      </ProfileSection>

      <ProfileSection title={`School Policies · ${policies.length} on file`}>
        <div className="flex flex-wrap gap-2">
          {policyCategories.map((category) => {
            const count = policies.filter((policy) => policy.category === category).length;
            if (count === 0) return null;
            return (
              <Badge key={category}>
                {category} &middot; {count}
              </Badge>
            );
          })}
        </div>
      </ProfileSection>

      <ProfileSection title="Procurement">
        <Table>
          <Thead>
            <Tr>
              <Th>Item</Th>
              <Th>Quantity</Th>
              <Th>Requested</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {resourceRequests.map((request) => {
              const next = NEXT_STATUS[request.status];
              return (
                <Tr key={request.id}>
                  <Td>{request.itemName}</Td>
                  <Td className="text-parchment-dim">{request.quantity}</Td>
                  <Td className="text-parchment-dim">{formatDate(request.requestedAt)}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[request.status]}>{request.status}</Badge>
                  </Td>
                  <Td>
                    {next && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setResourceRequestStatus(request.id, next)}
                      >
                        Mark {next}
                      </Button>
                    )}
                  </Td>
                </Tr>
              );
            })}
            {resourceRequests.length === 0 && (
              <TableEmptyRow colSpan={5}>No resource requests on file.</TableEmptyRow>
            )}
          </Tbody>
        </Table>
      </ProfileSection>

      <ProfileSection title="Inventory" icon={Package}>
        <p className="text-parchment-dim text-sm">Physical school supplies and equipment, tracked by location.</p>
      </ProfileSection>
    </div>
  );
}
