import { Ticket, Send } from "lucide-react";
import {
  hogsmeadeServicesService,
  eligibility,
  visitRequirements,
  authorizedVisitDays,
  approvedShops,
} from "../../data/hogsmeadeServices";
import { ServiceHeader } from "../../components/studentServices/ServiceHeader";
import { ProfileSection } from "../../components/character/ProfileSection";

export function HogsmeadeServicesPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <ServiceHeader service={hogsmeadeServicesService} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Student Eligibility">
          <p className="text-parchment-dim text-sm">{eligibility.description}</p>
        </ProfileSection>

        <ProfileSection title="Authorized Visit Days">
          <ul className="flex flex-col gap-1.5">
            {authorizedVisitDays.map((day) => (
              <li key={day} className="text-parchment-dim text-sm">
                &bull; {day}
              </li>
            ))}
          </ul>
        </ProfileSection>
      </div>

      <ProfileSection title="Visit Requirements">
        <ul className="flex flex-col gap-1.5">
          {visitRequirements.map((requirement) => (
            <li key={requirement} className="text-parchment-dim text-sm">
              &bull; {requirement}
            </li>
          ))}
        </ul>
      </ProfileSection>

      <ProfileSection title="Approved Shops">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {approvedShops.map((shop) => (
            <div key={shop.id} className="border border-parchment-dim/15 rounded-sm px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-parchment text-sm font-display">{shop.name}</p>
                <span className="text-[10px] uppercase tracking-wide text-parchment-dim">{shop.category}</span>
              </div>
              <p className="text-parchment-dim text-xs">{shop.description}</p>
            </div>
          ))}
        </div>
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Visit Permit" icon={Ticket}>
          <p className="text-parchment-dim text-sm">Requesting a visit permit isn't available yet.</p>
        </ProfileSection>
        <ProfileSection title="Online Requests" icon={Send}>
          <p className="text-parchment-dim text-sm">Submitting an online request isn't available yet.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
