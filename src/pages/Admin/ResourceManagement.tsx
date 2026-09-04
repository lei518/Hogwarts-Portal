import { Package } from "lucide-react";
import { books, bookCategories } from "../../data/books";
import { policies, policyCategories } from "../../data/policies";
import { useAdminScope } from "../../utils/adminScope";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import type { ResourceRequestStatus } from "../../types/adminPortal";

const STATUS_COLORS: Record<ResourceRequestStatus, string> = {
  Pending: "#c9a646",
  Ordered: "#8ba6c9",
  Delivered: "#6b9e6b",
  Archived: "#8a8478",
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
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">📦 Resource Management</h1>
        <p className="text-parchment-dim text-sm">A review of the Library catalog and School Policies.</p>
      </div>

      <ProfileSection title={`Library Catalog · ${books.length} titles`}>
        <div className="flex flex-wrap gap-2">
          {bookCategories.map((category) => {
            const count = books.filter((book) => book.category === category).length;
            if (count === 0) return null;
            return (
              <span
                key={category}
                className="text-xs px-3 py-1.5 rounded-full border border-parchment-dim/25 text-parchment-dim"
              >
                {category} &middot; {count}
              </span>
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
              <span
                key={category}
                className="text-xs px-3 py-1.5 rounded-full border border-parchment-dim/25 text-parchment-dim"
              >
                {category} &middot; {count}
              </span>
            );
          })}
        </div>
      </ProfileSection>

      <ProfileSection title="Procurement">
        <div className="flex flex-col gap-2">
          {resourceRequests.map((request) => {
            const color = STATUS_COLORS[request.status];
            const next = NEXT_STATUS[request.status];
            return (
              <div
                key={request.id}
                className="flex items-center justify-between gap-3 border border-parchment-dim/10 rounded-sm px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-parchment text-sm truncate">
                    {request.itemName} &middot; {request.quantity}
                  </p>
                  <p className="text-parchment-dim text-xs">Requested {formatDate(request.requestedAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                    style={{ color, borderColor: `${color}66`, background: `${color}15` }}
                  >
                    {request.status}
                  </span>
                  {next && (
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      onClick={() => setResourceRequestStatus(request.id, next)}
                    >
                      Mark {next}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ProfileSection>

      <ProfileSection title="Inventory" icon={Package}>
        <p className="text-parchment-dim text-sm">
          Physical school supplies and equipment tracking will be available here in a future milestone.
        </p>
      </ProfileSection>
    </div>
  );
}
