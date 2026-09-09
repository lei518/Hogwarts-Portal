import { Cog, ConciergeBell } from "lucide-react";
import { hospitalWingService, recoveryRooms } from "../../data/hospitalWing";
import { owleryService, registeredOwls } from "../../data/owleryServices";
import { libraryServicesService, borrowedBooks, reservedBooks } from "../../data/libraryServices";
import { hogsmeadeServicesService, approvedShops } from "../../data/hogsmeadeServices";
import { lostAndFoundService, lostFoundItems } from "../../data/lostAndFound";
import { studentSupportService, supportServices } from "../../data/studentSupport";
import { useAdminScope } from "../../utils/adminScope";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge, type BadgeTone } from "../../components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from "../../components/ui/Table";
import type { StudentService } from "../../types/studentServices";
import type { ServiceRequestStatus } from "../../types/adminPortal";

interface ServiceOverview {
  service: StudentService;
  itemLabel: string;
  itemCount: number;
}

// Review dashboard over all six Student Services (Phase 4 predecessor
// milestone) - Admin Portal reads each one's own data file directly, the
// same "known, accepted near-term duplication" precedent Student Services
// itself already established for overlapping physical places. No writes,
// no new data model.
const overviews: ServiceOverview[] = [
  { service: hospitalWingService, itemLabel: "recovery rooms", itemCount: recoveryRooms.length },
  { service: owleryService, itemLabel: "registered owls", itemCount: registeredOwls.length },
  {
    service: libraryServicesService,
    itemLabel: "active loans/reservations",
    itemCount: borrowedBooks.length + reservedBooks.length,
  },
  { service: hogsmeadeServicesService, itemLabel: "approved shops", itemCount: approvedShops.length },
  { service: lostAndFoundService, itemLabel: "unclaimed items", itemCount: lostFoundItems.filter((i) => i.status === "Unclaimed").length },
  { service: studentSupportService, itemLabel: "support services", itemCount: supportServices.length },
];

const REQUEST_STATUS_TONE: Record<ServiceRequestStatus, BadgeTone> = {
  Pending: "gold",
  Approved: "emerald",
  Rejected: "maroon",
};

// Authentication Foundation (Phase 6C): routed through useAdminScope(),
// the single hook every Admin page uses - service requests are still
// shared/global (unchanged).
export function ServicesManagementPage() {
  const { serviceRequests, approveServiceRequest, rejectServiceRequest, resetServiceRequest, loading } =
    useAdminScope();

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading services…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Services Management"
        description="A review of every Student Service."
        icon={ConciergeBell}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {overviews.map(({ service, itemLabel, itemCount }) => (
          <Card key={service.id} className="px-5 py-4">
            <p className="text-parchment-dim text-xs uppercase tracking-[0.15em] mb-1">{service.category}</p>
            <p className="font-display text-lg text-parchment mb-2">{service.name}</p>
            <p className="text-parchment-dim text-sm mb-1">{service.hours.display}</p>
            <p className="text-gold-bright text-sm">
              {itemCount} {itemLabel}
            </p>
          </Card>
        ))}
      </div>

      <ProfileSection title="Service Requests">
        <Table>
          <Thead>
            <Tr>
              <Th>Service</Th>
              <Th>Summary</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {serviceRequests.map((request) => {
              const service = overviews.find((o) => o.service.id === request.serviceId)?.service;
              return (
                <Tr key={request.id}>
                  <Td>{service?.name ?? request.serviceId}</Td>
                  <Td className="text-parchment-dim">{request.summary}</Td>
                  <Td>
                    <Badge tone={REQUEST_STATUS_TONE[request.status]}>{request.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      {request.status !== "Approved" && (
                        <Button variant="secondary" size="sm" onClick={() => approveServiceRequest(request.id)}>
                          Approve
                        </Button>
                      )}
                      {request.status !== "Rejected" && (
                        <Button variant="secondary" size="sm" onClick={() => rejectServiceRequest(request.id)}>
                          Reject
                        </Button>
                      )}
                      {request.status !== "Pending" && (
                        <Button variant="secondary" size="sm" onClick={() => resetServiceRequest(request.id)}>
                          Reset
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
            {serviceRequests.length === 0 && (
              <TableEmptyRow colSpan={4}>No service requests on file.</TableEmptyRow>
            )}
          </Tbody>
        </Table>
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Service Coordination" icon={Cog}>
          <p className="text-parchment-dim text-sm">Review available campus services and current requests.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
