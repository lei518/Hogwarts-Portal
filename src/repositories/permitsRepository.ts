import type { PermitsRepository } from "./interfaces/repositoryTypes";
import { createPermit, listPermits, updatePermitStatus } from "../services/supabase";

// Phase 5 - Hogsmeade Services. Backed by the live `permits` table; RLS
// scopes getAll() to a student's own permits, or - for the Deputy
// Headmaster/admin - every permit.
export const permitsRepository: PermitsRepository = {
  getAll: () => listPermits(),
  create: (input) => createPermit(input),
  updateStatus: (id, status, approvedBy) => updatePermitStatus(id, status, approvedBy),
};
