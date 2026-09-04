import { Cog } from "lucide-react";
import { hospitalWingService, recoveryRooms } from "../../data/hospitalWing";
import { owleryService, registeredOwls } from "../../data/owleryServices";
import { libraryServicesService, borrowedBooks, reservedBooks } from "../../data/libraryServices";
import { hogsmeadeServicesService, approvedShops } from "../../data/hogsmeadeServices";
import { lostAndFoundService, lostFoundItems } from "../../data/lostAndFound";
import { studentSupportService, supportServices } from "../../data/studentSupport";
import { useAdminScope } from "../../utils/adminScope";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
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

const REQUEST_STATUS_COLORS: Record<ServiceRequestStatus, string> = {
  Pending: "#c9a646",
  Approved: "#6b9e6b",
  Rejected: "#c77b7b",
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
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🛎️ Services Management</h1>
        <p className="text-parchment-dim text-sm">A review of every Student Service.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {overviews.map(({ service, itemLabel, itemCount }) => (
          <div key={service.id} className="border border-parchment-dim/20 rounded-sm px-5 py-4">
            <p className="text-parchment-dim text-xs uppercase tracking-[0.15em] mb-1">{service.category}</p>
            <p className="font-display text-lg text-parchment mb-2">{service.name}</p>
            <p className="text-parchment-dim text-sm mb-1">{service.hours.display}</p>
            <p className="text-gold-bright text-sm">
              {itemCount} {itemLabel}
            </p>
          </div>
        ))}
      </div>

      <ProfileSection title="Service Requests">
        <div className="flex flex-col gap-2">
          {serviceRequests.map((request) => {
            const service = overviews.find((o) => o.service.id === request.serviceId)?.service;
            const color = REQUEST_STATUS_COLORS[request.status];
            return (
              <div key={request.id} className="border border-parchment-dim/10 rounded-sm px-4 py-3">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-parchment text-sm">{service?.name ?? request.serviceId}</p>
                  <span
                    className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
                    style={{ color, borderColor: `${color}66`, background: `${color}15` }}
                  >
                    {request.status}
                  </span>
                </div>
                <p className="text-parchment-dim text-xs mb-2">{request.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {request.status !== "Approved" && (
                    <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => approveServiceRequest(request.id)}>
                      Approve
                    </Button>
                  )}
                  {request.status !== "Rejected" && (
                    <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => rejectServiceRequest(request.id)}>
                      Reject
                    </Button>
                  )}
                  {request.status !== "Pending" && (
                    <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => resetServiceRequest(request.id)}>
                      Reset to Pending
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Automation Rules" icon={Cog}>
          <p className="text-parchment-dim text-sm">
            Automatic routing or escalation rules for these services will be available here in a future
            milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
