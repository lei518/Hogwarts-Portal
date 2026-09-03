import type { StudentService } from "../../types/studentServices";
import { ProfileField } from "../character/ProfileSection";

// The shared masthead every Student Services page opens with - built once
// around the StudentService/ServiceLocation/ServiceHours shapes so all six
// pages present location/hours consistently without repeating markup.
export function ServiceHeader({ service }: { service: StudentService }) {
  return (
    <section className="border border-parchment-dim/20 rounded-sm px-6 py-6">
      <p className="text-parchment-dim text-xs uppercase tracking-[0.2em] mb-1">{service.category}</p>
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-3">{service.name}</h1>
      <p className="text-parchment text-sm leading-relaxed mb-5">{service.description}</p>
      <div className="grid grid-cols-2 gap-4">
        <ProfileField
          label="Location"
          value={
            service.location.building
              ? `${service.location.name}, ${service.location.building}`
              : service.location.name
          }
        />
        <ProfileField label="Hours" value={service.hours.display} />
      </div>
    </section>
  );
}
