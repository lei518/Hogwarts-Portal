import { FileText, CalendarCheck } from "lucide-react";
import {
  hospitalWingService,
  matron,
  availableServices,
  emergencyCare,
  recoveryRooms,
} from "../../data/hospitalWing";
import { ServiceHeader } from "../../components/studentServices/ServiceHeader";
import { ProfileSection, ProfileField } from "../../components/character/ProfileSection";

const ROOM_STATUS_COLORS: Record<string, string> = {
  Available: "#6b9e6b",
  Occupied: "#c77b7b",
  Reserved: "#c9a646",
};

export function HospitalWingPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <ServiceHeader service={hospitalWingService} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Matron">
          <ProfileField label="Name" value={matron.name} />
          <div className="mt-3">
            <ProfileField label="Title" value={matron.title} />
          </div>
        </ProfileSection>

        <ProfileSection title="Emergency Care">
          <p className="text-parchment-dim text-sm">{emergencyCare.description}</p>
        </ProfileSection>
      </div>

      <ProfileSection title="Available Services">
        <div className="flex flex-col gap-3">
          {availableServices.map((service) => (
            <div key={service.id}>
              <p className="text-parchment text-sm font-display">{service.name}</p>
              <p className="text-parchment-dim text-xs">{service.description}</p>
            </div>
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title="Recovery Rooms">
        <div className="flex flex-col gap-2">
          {recoveryRooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-parchment text-sm">{room.name}</p>
                <p className="text-parchment-dim text-xs">Capacity: {room.capacity}</p>
              </div>
              <span
                className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                style={{
                  color: ROOM_STATUS_COLORS[room.status],
                  borderColor: `${ROOM_STATUS_COLORS[room.status]}66`,
                  background: `${ROOM_STATUS_COLORS[room.status]}15`,
                }}
              >
                {room.status}
              </span>
            </div>
          ))}
        </div>
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Medical Records" icon={FileText}>
          <p className="text-parchment-dim text-sm">
            Your medical history isn't available here yet.
          </p>
        </ProfileSection>
        <ProfileSection title="Appointment Requests" icon={CalendarCheck}>
          <p className="text-parchment-dim text-sm">
            Requesting an appointment isn't available yet.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
