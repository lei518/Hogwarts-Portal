import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type {
  AccountStatus,
  AdminUserAccount,
  CalendarDraft,
  CreateAccountInput,
  HousePointAdjustment,
  ResourceRequest,
  ServiceRequest,
  ServiceRequestStatus,
  ResourceRequestStatus,
} from "../types/adminPortal";
import type { House } from "../types/game";
import { adminRepository } from "../repositories/adminRepository";

// Admin Operations (Phase 4B) - the single owner of all administrative
// state, local and in-memory only (resets on reload), same pattern as
// ProfessorAssignmentsContext/ProfessorGradesContext. Deliberately its own
// Context: Admin Portal owns none of Character, ManagedAssignment, or
// StudentSubmission, and this state is never placed inside GameContext or
// either Professor context - see CLAUDE.md's Admin Portal section. Scoped
// to AdminLayout only (not lifted to the app root) because nothing outside
// the Admin Portal reads it.
//
// Phase 5B: all five collections are seeded through adminRepository's real
// (Promise-based) interface in one effect on mount - see
// ProfessorAssignmentsContext's own comment for why `loading` is brief and
// every later write stays synchronous local state.
// Shared shape for both async account-write actions (createAccount and,
// as of Phase 6E, updateAccountStatus) - neither throws; both return this
// so the calling page can show the exact honest error inline.
export type AdminActionResult = { success: true } | { success: false; error: string };

interface AdminContextValue {
  accounts: AdminUserAccount[];
  accountsError: string | null;
  loading: boolean;
  creatingAccount: boolean;
  createAccount: (input: CreateAccountInput) => Promise<AdminActionResult>;
  updatingAccountStatus: boolean;
  updateAccountStatus: (accountId: string, status: AccountStatus) => Promise<AdminActionResult>;
  resettingPassword: boolean;
  resetAccountPassword: (accountId: string, newPassword: string) => Promise<AdminActionResult>;
  deletingAccount: boolean;
  deleteAccount: (accountId: string) => Promise<AdminActionResult>;

  serviceRequests: ServiceRequest[];
  approveServiceRequest: (id: string) => void;
  rejectServiceRequest: (id: string) => void;
  resetServiceRequest: (id: string) => void;

  calendarDrafts: CalendarDraft[];
  createCalendarDraft: (input: Omit<CalendarDraft, "id" | "status">) => CalendarDraft;
  updateCalendarDraft: (id: string, updates: Partial<Omit<CalendarDraft, "id">>) => void;
  deleteCalendarDraft: (id: string) => void;
  publishCalendarDraft: (id: string) => void;

  housePointAdjustments: HousePointAdjustment[];
  addHousePointAdjustment: (input: { house: House; amount: number; reason: string; adminName: string }) => void;
  markAdjustmentReviewed: (id: string) => void;

  resourceRequests: ResourceRequest[];
  setResourceRequestStatus: (id: string, status: ResourceRequestStatus) => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<AdminUserAccount[]>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [calendarDrafts, setCalendarDrafts] = useState<CalendarDraft[]>([]);
  const [housePointAdjustments, setHousePointAdjustments] = useState<HousePointAdjustment[]>([]);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [updatingAccountStatus, setUpdatingAccountStatus] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Real Account Listing (Phase 6I) - accounts now come from a genuine
    // network call (the admin-list-accounts Edge Function), unlike the
    // other four collections below, which are still local seed reads that
    // can't fail. Fetched separately, with its own error handling, so an
    // undeployed/unreachable Edge Function reports an honest per-section
    // error instead of failing the whole Promise.all and leaving every
    // other Admin Portal page's data stuck in `loading` forever.
    const accountsLoad = adminRepository
      .getAccounts()
      .then((fetchedAccounts) => {
        if (cancelled) return;
        setAccounts(fetchedAccounts);
      })
      .catch((err) => {
        if (cancelled) return;
        setAccountsError(err instanceof Error ? err.message : "Could not load accounts.");
      });

    const otherDataLoad = Promise.all([
      adminRepository.getServiceRequests(),
      adminRepository.getCalendarDrafts(),
      adminRepository.getHousePointAdjustments(),
      adminRepository.getResourceRequests(),
    ]).then(([seededServiceRequests, seededCalendarDrafts, seededAdjustments, seededResourceRequests]) => {
      if (cancelled) return;
      setServiceRequests(seededServiceRequests);
      setCalendarDrafts(seededCalendarDrafts);
      setHousePointAdjustments(seededAdjustments);
      setResourceRequests(seededResourceRequests);
    });

    Promise.all([accountsLoad, otherDataLoad]).then(() => {
      if (cancelled) return;
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function setServiceRequestStatus(id: string, status: ServiceRequestStatus) {
    setServiceRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status } : request)));
  }
  const approveServiceRequest = (id: string) => setServiceRequestStatus(id, "Approved");
  const rejectServiceRequest = (id: string) => setServiceRequestStatus(id, "Rejected");
  const resetServiceRequest = (id: string) => setServiceRequestStatus(id, "Pending");

  function createCalendarDraft(input: Omit<CalendarDraft, "id" | "status">): CalendarDraft {
    const created: CalendarDraft = { ...input, id: crypto.randomUUID(), status: "Draft" };
    setCalendarDrafts((prev) => [created, ...prev]);
    return created;
  }
  function updateCalendarDraft(id: string, updates: Partial<Omit<CalendarDraft, "id">>) {
    setCalendarDrafts((prev) => prev.map((draft) => (draft.id === id ? { ...draft, ...updates } : draft)));
  }
  function deleteCalendarDraft(id: string) {
    setCalendarDrafts((prev) => prev.filter((draft) => draft.id !== id));
  }
  function publishCalendarDraft(id: string) {
    updateCalendarDraft(id, { status: "Published" });
  }

  // Never touches Character.housePoints - this is a separate,
  // administrative-only ledger (see types/adminPortal.ts's
  // HousePointAdjustment comment).
  function addHousePointAdjustment(input: { house: House; amount: number; reason: string; adminName: string }) {
    const adjustment: HousePointAdjustment = {
      ...input,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      reviewed: false,
    };
    setHousePointAdjustments((prev) => [adjustment, ...prev]);
  }
  function markAdjustmentReviewed(id: string) {
    setHousePointAdjustments((prev) =>
      prev.map((adjustment) => (adjustment.id === id ? { ...adjustment, reviewed: true } : adjustment))
    );
  }

  function setResourceRequestStatus(id: string, status: ResourceRequestStatus) {
    setResourceRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status } : request)));
  }

  // Account Creation (Phase 6D) - the first genuinely async write this
  // context makes. Calls the repository (which in turn calls the
  // privileged Edge Function - see adminRepository.ts's own comment),
  // then folds the result straight into local state so the new account
  // appears immediately, no refetch/page-refresh needed - same
  // "prepend to local state" pattern createCalendarDraft already uses.
  // Returns a result object rather than throwing so
  // UserAdministrationPage can show the exact honest error inline.
  async function createAccount(input: CreateAccountInput): Promise<AdminActionResult> {
    setCreatingAccount(true);
    try {
      const account = await adminRepository.createAccount(input);
      setAccounts((prev) => [account, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Could not create the account." };
    } finally {
      setCreatingAccount(false);
    }
  }

  // Account Status (Phase 6E) - replaces the old local-only
  // enable/disable/lock/unlockAccount. `accountId` is AdminUserAccount.id
  // (what the page/list already keys off of); the real Supabase user id
  // the repository needs is resolved from that account's own `userId`
  // field here, not passed in from the page, so UserAdministrationPage
  // never has to know the two ids are different. A seeded/illustrative
  // account (no `userId` - see types/adminPortal.ts's own comment) has no
  // real Supabase user to update, so this honestly refuses rather than
  // pretending the change happened.
  async function updateAccountStatus(accountId: string, status: AccountStatus): Promise<AdminActionResult> {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) {
      return { success: false, error: "That account could not be found." };
    }
    if (!account.userId) {
      return { success: false, error: "This account isn't linked to a real Supabase user yet." };
    }

    setUpdatingAccountStatus(true);
    try {
      await adminRepository.updateAccountStatus(account.userId, status);
      setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, status } : a)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Could not update the account's status." };
    } finally {
      setUpdatingAccountStatus(false);
    }
  }

  // Administrator-Initiated Password Reset (Phase 6F) - same shape as
  // updateAccountStatus above: resolves the account's real Supabase user
  // id from local state, honestly refuses for a seeded/illustrative
  // account with none, otherwise calls the repository and reports the
  // outcome. Nothing in local `accounts` state changes on success - a
  // password isn't part of AdminUserAccount, so there's nothing to fold
  // back in; the page only needs to know whether it worked.
  async function resetAccountPassword(accountId: string, newPassword: string): Promise<AdminActionResult> {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) {
      return { success: false, error: "That account could not be found." };
    }
    if (!account.userId) {
      return { success: false, error: "This account isn't linked to a real Supabase user yet." };
    }

    setResettingPassword(true);
    try {
      await adminRepository.resetAccountPassword(account.userId, newPassword);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Could not reset the account's password." };
    } finally {
      setResettingPassword(false);
    }
  }

  // Account Deletion (Phase 6G) - same shape as updateAccountStatus/
  // resetAccountPassword above: resolves the account's real Supabase user
  // id from local state, honestly refuses for a seeded/illustrative
  // account with none, otherwise calls the repository. On success, the
  // account is removed from local `accounts` state directly - no
  // refetch/page-refresh needed, same "fold the result straight into
  // local state" pattern every other write in this context already uses.
  async function deleteAccount(accountId: string): Promise<AdminActionResult> {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) {
      return { success: false, error: "That account could not be found." };
    }
    if (!account.userId) {
      return { success: false, error: "This account isn't linked to a real Supabase user yet." };
    }

    setDeletingAccount(true);
    try {
      await adminRepository.deleteAccount(account.userId);
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Could not delete the account." };
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <AdminContext.Provider
      value={{
        accounts,
        accountsError,
        loading,
        creatingAccount,
        createAccount,
        updatingAccountStatus,
        updateAccountStatus,
        resettingPassword,
        resetAccountPassword,
        deletingAccount,
        deleteAccount,
        serviceRequests,
        approveServiceRequest,
        rejectServiceRequest,
        resetServiceRequest,
        calendarDrafts,
        createCalendarDraft,
        updateCalendarDraft,
        deleteCalendarDraft,
        publishCalendarDraft,
        housePointAdjustments,
        addHousePointAdjustment,
        markAdjustmentReviewed,
        resourceRequests,
        setResourceRequestStatus,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
