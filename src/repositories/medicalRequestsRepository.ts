import type { MedicalRequestsRepository } from "./interfaces/repositoryTypes";
import { createMedicalRequest, listMedicalRequests, updateMedicalRequestStatus } from "../services/supabase";

// Phase 5 - Hospital Wing. Backed by the live `medical_requests` table; RLS
// scopes getAll() to a student's own requests, or - for a healer/admin -
// every request.
export const medicalRequestsRepository: MedicalRequestsRepository = {
  getAll: () => listMedicalRequests(),
  create: (input) => createMedicalRequest(input),
  updateStatus: (id, status, assignedStaff) => updateMedicalRequestStatus(id, status, assignedStaff),
};
