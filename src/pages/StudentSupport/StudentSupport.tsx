import { CalendarPlus, FileQuestion } from "lucide-react";
import { studentSupportService, supportServices } from "../../data/studentSupport";
import { ServiceHeader } from "../../components/studentServices/ServiceHeader";
import { ProfileSection } from "../../components/character/ProfileSection";

export function StudentSupportPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <ServiceHeader service={studentSupportService} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {supportServices.map((service) => (
          <ProfileSection key={service.id} title={service.name}>
            <p className="text-parchment-dim text-sm mb-2">{service.description}</p>
            <p className="text-parchment-dim text-xs">Contact: {service.contact}</p>
          </ProfileSection>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Appointment Booking" icon={CalendarPlus}>
          <p className="text-parchment-dim text-sm">Booking an appointment isn't available yet.</p>
        </ProfileSection>
        <ProfileSection title="Case Requests" icon={FileQuestion}>
          <p className="text-parchment-dim text-sm">Submitting a case request isn't available yet.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
