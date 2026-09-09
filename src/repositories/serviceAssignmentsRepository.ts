import type { ServiceAssignmentsRepository } from "./interfaces/repositoryTypes";
import { listServiceAssignments, upsertServiceAssignment } from "../services/supabase";

// Phase 6 - Service Administration. Backed by the live `service_assignments`
// table - assigning is a plain upsert (one row per service, enforced by
// the table's own unique constraint on service_name).
export const serviceAssignmentsRepository: ServiceAssignmentsRepository = {
  getAll: () => listServiceAssignments(),
  assign: (serviceName, staffUserId) => upsertServiceAssignment(serviceName, staffUserId),
};
