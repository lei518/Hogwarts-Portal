import { useEffect, useState } from "react";
import { UserCheck } from "lucide-react";
import type { DirectoryProfile, ServiceAssignmentRow, ServiceName } from "../../services/supabase";
import { listDirectoryProfiles } from "../../services/supabase";
import { serviceAssignmentsRepository } from "../../repositories/serviceAssignmentsRepository";
import { SERVICE_STAFF_ROLE, STAFF_ROLES } from "../../utils/serviceAssignments";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { Table, Thead, Tbody, Tr, Th, Td } from "../../components/ui/Table";
import { Select } from "../../components/ui/Input";

const UNASSIGNED = "";

// Phase 6 - Service Administration. Which staff account is responsible for
// each campus service, admin-configurable instead of hardcoded or absent
// (see supabase/migrations/0007_announcements_and_service_assignments.sql
// and CLAUDE.md's Student Services section). Same fetch-on-mount ->
// table+Select -> repository write -> local state update shape as
// CourseAssignments.tsx.
export function ServiceAdministrationPage() {
  const [assignments, setAssignments] = useState<ServiceAssignmentRow[]>([]);
  const [staffByRole, setStaffByRole] = useState<Map<string, DirectoryProfile[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [savingService, setSavingService] = useState<ServiceName | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      serviceAssignmentsRepository.getAll(),
      Promise.all(STAFF_ROLES.map((role) => listDirectoryProfiles(role))),
    ]).then(([loadedAssignments, staffLists]) => {
      if (cancelled) return;
      setAssignments(loadedAssignments);
      setStaffByRole(new Map(STAFF_ROLES.map((role, index) => [role, staffLists[index]])));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function optionsFor(serviceName: ServiceName): DirectoryProfile[] {
    const role = SERVICE_STAFF_ROLE[serviceName];
    if (role) return staffByRole.get(role) ?? [];
    // Owlery Administration - no dedicated staff role/dashboard exists yet
    // (reserved for a future pass), so any of the four staff roles is a
    // valid pick.
    return STAFF_ROLES.flatMap((r) => staffByRole.get(r) ?? []);
  }

  async function handleAssign(serviceName: ServiceName, staffUserId: string) {
    setSavingService(serviceName);
    setError(null);
    try {
      const updated = await serviceAssignmentsRepository.assign(serviceName, staffUserId || null);
      setAssignments((prev) => prev.map((a) => (a.serviceName === serviceName ? updated : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this assignment.");
    } finally {
      setSavingService(null);
    }
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading service assignments…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Service Administration"
        description="Assign a staff account to each campus service. Students and staff see this assignment as soon as it's saved."
        icon={UserCheck}
      />

      {error && <p className="text-ember text-xs">{error}</p>}

      <Table>
        <Thead>
          <Tr>
            <Th>Service</Th>
            <Th>Assigned Staff</Th>
          </Tr>
        </Thead>
        <Tbody>
          {assignments.map((assignment) => {
            const options = optionsFor(assignment.serviceName);
            return (
              <Tr key={assignment.id}>
                <Td>{assignment.serviceName}</Td>
                <Td>
                  {options.length === 0 ? (
                    <span className="text-parchment-dim text-xs">No eligible staff accounts yet.</span>
                  ) : (
                    <Select
                      value={assignment.staffUserId ?? UNASSIGNED}
                      onChange={(e) => handleAssign(assignment.serviceName, e.target.value)}
                      disabled={savingService === assignment.serviceName}
                      aria-label={`Assigned staff for ${assignment.serviceName}`}
                    >
                      <option value={UNASSIGNED}>Unassigned</option>
                      {options.map((profile) => (
                        <option key={profile.userId} value={profile.userId}>
                          {profile.displayName}
                        </option>
                      ))}
                    </Select>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
}
