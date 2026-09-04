import type { AdminProfile } from "../types/adminPortal";
import { useAuthenticatedAdmin } from "../context/AuthenticatedAdminContext";
import { useAdmin } from "../context/AdminContext";

// Authentication Foundation (Phase 6C) - the one hook every Admin page
// goes through instead of importing data/adminPortal.ts or calling
// useAdmin()/AuthenticatedAdminContext directly, mirroring
// utils/professorScope.ts's useProfessorScope() exactly. Owns no state of
// its own: identity comes from AuthenticatedAdminContext, every
// operational collection and every write action below comes from
// AdminContext exactly as before (unchanged, still shared/global - this
// milestone only changes who the "profile" is, never what data an admin
// operation touches, per CLAUDE.md's Admin Portal section). No new source
// of truth is introduced.
export interface AdminScope {
  adminId: string | null;
  profile: AdminProfile | null;
  loading: boolean;
  refresh: () => void;

  accounts: ReturnType<typeof useAdmin>["accounts"];
  accountsError: ReturnType<typeof useAdmin>["accountsError"];
  creatingAccount: ReturnType<typeof useAdmin>["creatingAccount"];
  createAccount: ReturnType<typeof useAdmin>["createAccount"];
  updatingAccountStatus: ReturnType<typeof useAdmin>["updatingAccountStatus"];
  updateAccountStatus: ReturnType<typeof useAdmin>["updateAccountStatus"];
  resettingPassword: ReturnType<typeof useAdmin>["resettingPassword"];
  resetAccountPassword: ReturnType<typeof useAdmin>["resetAccountPassword"];
  deletingAccount: ReturnType<typeof useAdmin>["deletingAccount"];
  deleteAccount: ReturnType<typeof useAdmin>["deleteAccount"];

  serviceRequests: ReturnType<typeof useAdmin>["serviceRequests"];
  approveServiceRequest: ReturnType<typeof useAdmin>["approveServiceRequest"];
  rejectServiceRequest: ReturnType<typeof useAdmin>["rejectServiceRequest"];
  resetServiceRequest: ReturnType<typeof useAdmin>["resetServiceRequest"];

  calendarDrafts: ReturnType<typeof useAdmin>["calendarDrafts"];
  createCalendarDraft: ReturnType<typeof useAdmin>["createCalendarDraft"];
  updateCalendarDraft: ReturnType<typeof useAdmin>["updateCalendarDraft"];
  deleteCalendarDraft: ReturnType<typeof useAdmin>["deleteCalendarDraft"];
  publishCalendarDraft: ReturnType<typeof useAdmin>["publishCalendarDraft"];

  housePointAdjustments: ReturnType<typeof useAdmin>["housePointAdjustments"];
  addHousePointAdjustment: ReturnType<typeof useAdmin>["addHousePointAdjustment"];
  markAdjustmentReviewed: ReturnType<typeof useAdmin>["markAdjustmentReviewed"];

  resourceRequests: ReturnType<typeof useAdmin>["resourceRequests"];
  setResourceRequestStatus: ReturnType<typeof useAdmin>["setResourceRequestStatus"];
}

export function useAdminScope(): AdminScope {
  const { adminId, profile, loading: identityLoading, refresh: refreshIdentity } = useAuthenticatedAdmin();
  const adminData = useAdmin();

  return {
    ...adminData,
    adminId,
    profile,
    loading: identityLoading || adminData.loading,
    refresh: refreshIdentity,
  };
}
