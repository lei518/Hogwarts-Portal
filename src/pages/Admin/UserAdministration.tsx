import { useState, type FormEvent } from "react";
import { KeyRound, LayoutTemplate, UserPlus } from "lucide-react";
import { useAdminScope } from "../../utils/adminScope";
import { Button } from "../../components/ui/Button";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import type { AccountRole, AccountStatus } from "../../types/adminPortal";

const STATUS_COLORS: Record<AccountStatus, string> = {
  Active: "#6b9e6b",
  Suspended: "#c77b7b",
  Locked: "#8a8478",
  Pending: "#c9a646",
};

const ACCOUNT_ROLES: AccountRole[] = ["student", "professor", "admin"];

const inputClass =
  "w-full bg-void/50 border border-parchment-dim/30 rounded-sm px-3 py-2 text-sm text-parchment placeholder:text-parchment-dim/50 focus:border-gold outline-none";
const labelClass = "text-parchment-dim text-[11px] uppercase tracking-wide mb-1 block";

const emptyForm = { displayName: "", email: "", password: "", role: "student" as AccountRole };

// Canonical owner of AdminUserAccount - the one genuinely new data model
// from Phase 4A, now editable through AdminContext (Phase 4B). Changes are
// local/session-only; nothing here writes into Student or Professor
// canonical data. See CLAUDE.md's Admin Portal section.
// Authentication Foundation (Phase 6C): routed through useAdminScope(),
// the single hook every Admin page uses - accounts/operations here are
// still shared/global (unchanged; see CLAUDE.md's Admin Portal section),
// this only changes the seam the page reads them through.
//
// Account Creation (Phase 6D): the form below is real, not a placeholder -
// submitting it calls useAdminScope()'s createAccount(), which goes
// through AdminContext -> the repository -> the privileged Edge Function
// (see services/supabase.ts's adminCreateAccount comment for why that
// last hop can't happen from this page or any client code directly). This
// page only ever calls createAccount() - it contains no authentication
// logic itself, and never bypasses AdminContext.
//
// Account Status (Phase 6E): the Enable/Disable/Lock/Unlock buttons below
// are unchanged - same labels, same positions, same per-status visibility.
// Only their onClick wiring changed: each now calls useAdminScope()'s
// updateAccountStatus() with the target AccountStatus, which is a real,
// awaited Supabase write (see AdminContext.tsx's own comment on how it
// resolves the real Supabase user id and honestly refuses for the
// seeded/illustrative accounts that don't have one). This page still
// contains no authentication logic and knows nothing about JWTs or
// service_role - it only calls updateAccountStatus() and shows whatever
// error comes back.
//
// Administrator-Initiated Password Reset (Phase 6F): a "Reset Password"
// button on every row reveals an inline form (same "editingId reveals an
// inline form" idiom CalendarManagement.tsx's draft editor already uses)
// where the admin types a temporary password and submits - calling
// useAdminScope()'s resetAccountPassword(). Not a redesign: nothing
// existing in the row moves, this only adds content beneath it while
// active.
//
// Account Deletion (Phase 6G): a "Delete" button on every row reveals the
// same kind of inline confirmation (no modal library, same idiom as Reset
// Password above) before calling useAdminScope()'s deleteAccount(). On
// success the account simply disappears from the list, since
// AdminContext already removed it from local state - no refetch needed.
// Real Account Listing (Phase 6I): `accounts` now reflects real
// public.profiles rows (via useAdminScope() -> AdminContext ->
// adminRepository -> the privileged admin-list-accounts Edge Function),
// not the seeded adminUserAccounts array - this page's own code is
// otherwise unchanged, since it already only ever read `accounts` off
// useAdminScope() and never imported the seed file directly.
export function UserAdministrationPage() {
  const {
    accounts,
    accountsError,
    creatingAccount,
    createAccount,
    updatingAccountStatus,
    updateAccountStatus,
    resettingPassword,
    resetAccountPassword,
    deletingAccount,
    deleteAccount,
    loading,
  } = useAdminScope();

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [resetPasswordAccountId, setResetPasswordAccountId] = useState<string | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const [deleteConfirmAccountId, setDeleteConfirmAccountId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Any in-flight write against an account disables every other action on
  // that row (and the row-level toggles), so nothing gets double-submitted.
  const anyActionRunning = updatingAccountStatus || resettingPassword || deletingAccount;

  async function handleStatusChange(accountId: string, status: AccountStatus) {
    setStatusError(null);
    const result = await updateAccountStatus(accountId, status);
    if (!result.success) {
      setStatusError(result.error);
    }
  }

  function startPasswordReset(accountId: string) {
    setResetPasswordAccountId(accountId);
    setResetPasswordValue("");
    setResetPasswordError(null);
  }

  function cancelPasswordReset() {
    setResetPasswordAccountId(null);
    setResetPasswordValue("");
    setResetPasswordError(null);
  }

  async function handlePasswordResetSubmit(event: FormEvent, accountId: string) {
    event.preventDefault();
    setResetPasswordError(null);

    if (!resetPasswordValue) {
      setResetPasswordError("Enter a temporary password.");
      return;
    }

    const result = await resetAccountPassword(accountId, resetPasswordValue);
    if (!result.success) {
      setResetPasswordError(result.error);
      return;
    }
    cancelPasswordReset();
  }

  function startDeleteConfirm(accountId: string) {
    setDeleteConfirmAccountId(accountId);
    setDeleteError(null);
  }

  function cancelDeleteConfirm() {
    setDeleteConfirmAccountId(null);
    setDeleteError(null);
  }

  async function handleConfirmDelete(accountId: string) {
    setDeleteError(null);
    const result = await deleteAccount(accountId);
    if (!result.success) {
      setDeleteError(result.error);
      return;
    }
    // Account is already gone from `accounts` (AdminContext removed it),
    // so the row itself unmounts - nothing left to clear here.
    setDeleteConfirmAccountId(null);
  }

  async function handleCreateAccount(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!form.displayName.trim() || !form.email.trim() || !form.password) {
      setFormError("Display name, email, and temporary password are all required.");
      return;
    }
    if (!ACCOUNT_ROLES.includes(form.role)) {
      setFormError("Choose a valid role.");
      return;
    }

    const result = await createAccount({
      displayName: form.displayName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });

    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setForm(emptyForm);
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <LoadingState label="Loading accounts…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🔐 User Administration</h1>
        <p className="text-parchment-dim text-sm">Accounts, roles, and status.</p>
      </div>

      {accountsError && <p className="text-[#c77b7b] text-xs">{accountsError}</p>}
      {statusError && <p className="text-[#c77b7b] text-xs">{statusError}</p>}

      <div className="flex flex-col gap-2">
        {accounts.map((account) => {
          const color = STATUS_COLORS[account.status];
          return (
            <div key={account.id} className="border border-parchment-dim/20 rounded-sm px-5 py-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="font-display text-lg text-parchment truncate">{account.displayName}</p>
                <p className="text-parchment-dim text-xs uppercase tracking-wide">{account.role}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                  style={{ color, borderColor: `${color}66`, background: `${color}15` }}
                >
                  {account.status}
                </span>

                {account.status === "Active" && (
                  <>
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      disabled={anyActionRunning}
                      onClick={() => handleStatusChange(account.id, "Suspended")}
                    >
                      Disable
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      disabled={anyActionRunning}
                      onClick={() => handleStatusChange(account.id, "Locked")}
                    >
                      Lock
                    </Button>
                  </>
                )}
                {account.status === "Suspended" && (
                  <>
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      disabled={anyActionRunning}
                      onClick={() => handleStatusChange(account.id, "Active")}
                    >
                      Enable
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      disabled={anyActionRunning}
                      onClick={() => handleStatusChange(account.id, "Locked")}
                    >
                      Lock
                    </Button>
                  </>
                )}
                {account.status === "Locked" && (
                  <Button
                    variant="secondary"
                    className="px-3 py-1 text-xs"
                    disabled={anyActionRunning}
                    onClick={() => handleStatusChange(account.id, "Active")}
                  >
                    Unlock
                  </Button>
                )}
                {account.status === "Pending" && (
                  <Button
                    variant="secondary"
                    className="px-3 py-1 text-xs"
                    disabled={anyActionRunning}
                    onClick={() => handleStatusChange(account.id, "Active")}
                  >
                    Enable
                  </Button>
                )}
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                  disabled={anyActionRunning}
                  onClick={() =>
                    resetPasswordAccountId === account.id ? cancelPasswordReset() : startPasswordReset(account.id)
                  }
                >
                  Reset Password
                </Button>
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                  disabled={anyActionRunning}
                  onClick={() =>
                    deleteConfirmAccountId === account.id ? cancelDeleteConfirm() : startDeleteConfirm(account.id)
                  }
                >
                  Delete
                </Button>
              </div>
            </div>

            {resetPasswordAccountId === account.id && (
              <form
                onSubmit={(e) => handlePasswordResetSubmit(e, account.id)}
                className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-parchment-dim/10"
              >
                <div className="flex-1 min-w-45">
                  <label className={labelClass} htmlFor={`reset-password-${account.id}`}>
                    Temporary Password
                  </label>
                  <input
                    id={`reset-password-${account.id}`}
                    type="password"
                    className={inputClass}
                    value={resetPasswordValue}
                    onChange={(e) => setResetPasswordValue(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="px-3 py-1 text-xs" disabled={anyActionRunning}>
                  {resettingPassword ? "Resetting…" : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                  disabled={anyActionRunning}
                  onClick={cancelPasswordReset}
                >
                  Cancel
                </Button>
                {resetPasswordError && <p className="text-[#c77b7b] text-xs w-full">{resetPasswordError}</p>}
              </form>
            )}

            {deleteConfirmAccountId === account.id && (
              <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-parchment-dim/10">
                <p className="text-parchment-dim text-xs flex-1 min-w-45">
                  Delete {account.displayName}'s account? This cannot be undone.
                </p>
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                  disabled={anyActionRunning}
                  onClick={() => handleConfirmDelete(account.id)}
                >
                  {deletingAccount ? "Deleting…" : "Confirm Delete"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                  disabled={anyActionRunning}
                  onClick={cancelDeleteConfirm}
                >
                  Cancel
                </Button>
                {deleteError && <p className="text-[#c77b7b] text-xs w-full">{deleteError}</p>}
              </div>
            )}
            </div>
          );
        })}
      </div>

      <ProfileSection title="Create Account" icon={UserPlus}>
        <form onSubmit={handleCreateAccount} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="new-account-display-name">Display Name</label>
              <input
                id="new-account-display-name"
                className={inputClass}
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="new-account-email">Email</label>
              <input
                id="new-account-email"
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="new-account-password">Temporary Password</label>
              <input
                id="new-account-password"
                type="password"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="new-account-role">Role</label>
              <select
                id="new-account-role"
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AccountRole })}
              >
                {ACCOUNT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formError && <p className="text-[#c77b7b] text-xs">{formError}</p>}

          <div>
            <Button type="submit" disabled={creatingAccount}>
              {creatingAccount ? "Creating…" : "Create Account"}
            </Button>
          </div>
        </form>
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Permission Editor" icon={KeyRound}>
          <p className="text-parchment-dim text-sm">
            Changing what an account is allowed to do will be available here in a future milestone.
          </p>
        </ProfileSection>

        <ProfileSection title="Role Templates" icon={LayoutTemplate}>
          <p className="text-parchment-dim text-sm">
            Reusable permission bundles for common roles will be available here in a future milestone.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
