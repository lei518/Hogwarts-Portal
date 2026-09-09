import { useEffect, useState } from "react";
import type { ServiceName, UserRole } from "../services/supabase";
import { listDirectoryProfiles } from "../services/supabase";
import { serviceAssignmentsRepository } from "../repositories/serviceAssignmentsRepository";

// Phase 6 - Service Administration. Which staff role is eligible for each
// service's assignment picker (see pages/Admin/ServiceAdministration.tsx) -
// `null` for Owlery Administration means "any of the four staff roles",
// since no dedicated Owlery-staff role/dashboard exists (reserved for a
// future pass, see the Phase 6 plan's own scope note).
export const SERVICE_STAFF_ROLE: Record<ServiceName, UserRole | null> = {
  Library: "librarian",
  "Hospital Wing": "healer",
  "Lost & Found": "caretaker",
  "Hogsmeade Permits": "deputy_headmaster",
  "Owlery Administration": null,
};

export const STAFF_ROLES: UserRole[] = ["librarian", "healer", "caretaker", "deputy_headmaster"];

const UNASSIGNED_LABEL = "Currently unassigned";

// Small shared hook: resolves the currently assigned staff member's real
// display name for one service, reused by every student-facing service
// page and staff dashboard header instead of duplicating the same
// fetch-and-resolve logic 8 times.
export function useAssignedStaffName(serviceName: ServiceName): { name: string; loading: boolean } {
  const [name, setName] = useState(UNASSIGNED_LABEL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    serviceAssignmentsRepository.getAll().then(async (assignments) => {
      const assignment = assignments.find((a) => a.serviceName === serviceName);
      if (!assignment?.staffUserId) {
        if (!cancelled) {
          setName(UNASSIGNED_LABEL);
          setLoading(false);
        }
        return;
      }
      const directory = await listDirectoryProfiles();
      if (cancelled) return;
      const staff = directory.find((profile) => profile.userId === assignment.staffUserId);
      setName(staff?.displayName ?? UNASSIGNED_LABEL);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [serviceName]);

  return { name, loading };
}
