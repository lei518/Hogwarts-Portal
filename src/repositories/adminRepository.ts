import type { AdminRepository } from "./interfaces/repositoryTypes";
import type { AdminUserAccount, AccountStatus } from "../types/adminPortal";
import {
  adminProfiles,
  serviceRequestSeeds,
  calendarDraftSeeds,
  housePointAdjustmentSeeds,
  resourceRequestSeeds,
  getAdminProfileByDisplayName,
} from "../data/adminPortal";
import {
  adminCreateAccount,
  adminUpdateAccountStatus,
  adminResetPassword,
  adminDeleteAccount,
  adminListAccounts,
  type ProfileAccountStatus,
} from "../services/supabase";

// Account Status (Phase 6E). The Admin Portal's own AccountStatus has a
// fourth value, "Pending" (seed-only - no button ever sets it), that
// profiles.status was never asked to represent (see the migration's own
// comment: Active/Disabled/Locked only). This is the one place that
// translation happens - "Suspended" (this app's word) and "Disabled"
// (the DB's word) mean the same thing, so this stays a mapping, not a
// second status vocabulary.
function toProfileAccountStatus(status: AccountStatus): ProfileAccountStatus | null {
  if (status === "Active") return "Active";
  if (status === "Suspended") return "Disabled";
  if (status === "Locked") return "Locked";
  return null;
}

// Inverse of the above, used when reading real profiles rows back (Phase
// 6I) - "Pending" is never produced here, since profiles.status has no
// such value; it stays reachable only through data/adminPortal.ts's own
// (now-unused-by-this-repository, but still exported) seed shape.
function fromProfileAccountStatus(status: ProfileAccountStatus): AccountStatus {
  if (status === "Disabled") return "Suspended";
  return status;
}

// Seeds AdminContext's five useState calls - same pattern as
// managedAssignmentsRepository.ts/studentSubmissionsRepository.ts. Its sole
// consumer (AdminContext) now genuinely awaits these, so no sync escape
// hatch is needed.
//
// Authentication Foundation (Phase 6C): getProfileByDisplayName is the new
// method AuthenticatedAdminContext goes through - no page imports
// data/adminPortal.ts directly anymore (see Profile.tsx/
// HouseCupManagement.tsx, both now routed through useAdminScope()).
//
// Real Account Listing (Phase 6I): getAccounts() no longer returns the
// seeded adminUserAccounts array - it now calls adminListAccounts(),
// which goes through the privileged admin-list-accounts Edge Function
// (see that file's own comment on why a plain client query can't do
// this). data/adminPortal.ts's adminUserAccounts/getAdminUserAccounts
// are left exactly as they were - unused by this method now, but not
// removed, since other Admin Portal seed data (service requests,
// calendar drafts, house point adjustments, resource requests) is
// unaffected and this milestone touches only the account source.
export const adminRepository: AdminRepository = {
  getProfile: async () => adminProfiles[0],
  getAccounts: async () => {
    const rows = await adminListAccounts();
    return rows.map(
      (row): AdminUserAccount => ({
        id: `account-${row.userId}`,
        displayName: row.displayName,
        role: row.role,
        status: fromProfileAccountStatus(row.status),
        userId: row.userId,
      })
    );
  },
  getServiceRequests: async () => serviceRequestSeeds,
  getCalendarDrafts: async () => calendarDraftSeeds,
  getHousePointAdjustments: async () => housePointAdjustmentSeeds,
  getResourceRequests: async () => resourceRequestSeeds,
  getProfileByDisplayName: async (displayName) => getAdminProfileByDisplayName(displayName),
  createAccount: async (input) => {
    const result = await adminCreateAccount(input);
    // Real accounts have no seeded Student/Professor directory entry to
    // link to (linkedStudentId/linkedProfessorId stay undefined) - honest,
    // not fabricated, same as every other "no match" case in this project.
    const account: AdminUserAccount = {
      id: `account-${result.userId}`,
      displayName: result.displayName,
      role: result.role,
      status: "Active",
      userId: result.userId,
    };
    return account;
  },
  updateAccountStatus: async (accountId, status) => {
    // `accountId` here is the real Supabase Auth user id - AdminContext
    // resolves it from AdminUserAccount.userId before calling down (see
    // that file's own comment); this repository has no account list of
    // its own to look one up from.
    const profileStatus = toProfileAccountStatus(status);
    if (!profileStatus) {
      throw new Error(`"${status}" is not a real account status.`);
    }
    await adminUpdateAccountStatus(accountId, profileStatus);
  },
  resetAccountPassword: async (accountId, newPassword) => {
    // `accountId` here is the real Supabase Auth user id, same contract as
    // updateAccountStatus above.
    await adminResetPassword(accountId, newPassword);
  },
  deleteAccount: async (accountId) => {
    // `accountId` here is the real Supabase Auth user id, same contract as
    // updateAccountStatus/resetAccountPassword above.
    await adminDeleteAccount(accountId);
  },
};
