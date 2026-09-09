import { Link } from "react-router-dom";
import { PenLine, MapPinned } from "lucide-react";
import {
  owleryService,
  sendOwlPostInfo,
  incomingMailInfo,
  registeredOwls,
  deliveryInfo,
} from "../../data/owleryServices";
import { ServiceHeader } from "../../components/studentServices/ServiceHeader";
import { ProfileSection } from "../../components/character/ProfileSection";

const OWL_STATUS_COLORS: Record<string, string> = {
  Available: "#6b9e6b",
  "On Delivery": "#c9a646",
  Resting: "#8a8478",
};

export function OwleryServicesPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <ServiceHeader service={owleryService} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Send Owl Post">
          <p className="text-parchment-dim text-sm mb-3">{sendOwlPostInfo.description}</p>
          <Link to="/owlery" className="text-gold hover:text-gold-bright text-xs">
            Open your Inbox &rarr;
          </Link>
        </ProfileSection>

        <ProfileSection title="Incoming Mail Information">
          <p className="text-parchment-dim text-sm">{incomingMailInfo.description}</p>
        </ProfileSection>
      </div>

      <ProfileSection title="Registered Owls">
        <div className="flex flex-col gap-2">
          {registeredOwls.map((owl) => (
            <div key={owl.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-parchment text-sm">{owl.name}</p>
                <p className="text-parchment-dim text-xs">{owl.species}</p>
              </div>
              <span
                className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                style={{
                  color: OWL_STATUS_COLORS[owl.status],
                  borderColor: `${OWL_STATUS_COLORS[owl.status]}66`,
                  background: `${OWL_STATUS_COLORS[owl.status]}15`,
                }}
              >
                {owl.status}
              </span>
            </div>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title="Delivery Information">
        <p className="text-parchment-dim text-sm">{deliveryInfo.description}</p>
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Compose Owl" icon={PenLine}>
          <p className="text-parchment-dim text-sm">Owls are ready to carry a letter anywhere in the wizarding world.</p>
        </ProfileSection>
        <ProfileSection title="Delivery Tracking" icon={MapPinned}>
          <p className="text-parchment-dim text-sm">Every letter's journey, from the Owlery to its destination.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
