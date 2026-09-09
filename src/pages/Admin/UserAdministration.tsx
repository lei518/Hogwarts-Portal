import { useState, Fragment, type FormEvent } from "react";
import { KeyRound, LayoutTemplate, UserPlus, Users } from "lucide-react";
import { useAdminScope } from "../../utils/adminScope";
import { ROLES } from "../../services/supabase";
import { Button } from "../../components/ui/Button";
import { Badge, type BadgeTone } from "../../components/ui/Badge";
import { FormField } from "../../components/ui/FormField";
import { Input, Select } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { ProfileSection } from "../../components/character/ProfileSection";
import { LoadingState } from "../../components/ui/LoadingState";
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from "../../components/ui/Table";
import type { AccountRole, AccountStatus } from "../../types/adminPortal";
import type { House } from "../../types/game";

const STATUS_TONE: Record<AccountStatus, BadgeTone> = {
  Active: "emerald",
  Suspended: "maroon",
  Locked: "neutral",
  Pending: "gold",
};

// Phase 6 role-system audit: derived from the central ROLES object (see
// services/supabase.ts) instead of its own hand-typed literal array, which
// isn't exhaustiveness-checked against AccountRole/UserRole and could
// silently miss a role - unlike ROLE_LABELS below, a plain array like this
// used to have no compiler safety net at all.
const ACCOUNT_ROLES: AccountRole[] = Object.values(ROLES);

// Phase 5 - Campus Services: naive `charAt(0).toUpperCase()` capitalization
// renders "deputy_headmaster" as "Deputy_headmaster" - a real label map
// instead, for every role.
const ROLE_LABELS: Record<AccountRole, string> = {
  student: "Student",
  professor: "Professor",
  admin: "Admin",
  librarian: "Librarian",
  healer: "Healer",
  caretaker: "Caretaker",
  deputy_headmaster: "Deputy Headmaster",
};

// Year-Based Onboarding (Phase 6L). Year 1 is deliberately excluded from
// HOUSES's applicability, not from the list itself - a Year 1 student's
// house comes from the Sorting Hat ceremony, never the Admin (the House
// field below only ever shows for Year 2-7, see admin-create-account's own
// matching validation).
const YEARS = [1, 2, 3, 4, 5, 6, 7] as const;
const HOUSES: House[] = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"];

const emptyForm = {
  displayName: "",
  email: "",
  password: "",
  role: "student" as AccountRole,
  year: 1 as (typeof YEARS)[number],
  house: HOUSES[0],
};

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
// Year-Based Onboarding (Phase 6L): Year (Student role only) and House
// (Student + Year 2-7 only) were added to this same form - a Year 1
// student's house comes from the Sorting Hat instead, never the Admin.
// The submitted payload recomputes year/house from the *current*
// role/year at submit time (not just which inputs are visible), so a
// stale value left over from an earlier role/year choice is never sent.
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

    const isStudent = form.role === "student";
    const result = await createAccount({
      displayName: form.displayName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      year: isStudent ? form.year : undefined,
      house: isStudent && form.year >= 2 ? form.house : undefined,
    });

    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setForm(emptyForm);
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
        <LoadingState label="Loading accounts…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto flex flex-col gap-6">
      <PageHeader title="User Administration" description="Accounts, roles, and status." icon={Users} />

      {accountsError && <p className="text-ember text-xs">{accountsError}</p>}
      {statusError && <p className="text-ember text-xs">{statusError}</p>}

      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {accounts.map((account) => (
            <Fragment key={account.id}>
              <Tr>
                <Td className="font-display text-parchment">{account.displayName}</Td>
                <Td className="text-parchment-dim">{ROLE_LABELS[account.role]}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[account.status]}>{account.status}</Badge>
                </Td>
                <Td>
                  <div className="flex flex-wrap justify-end gap-2">
                    {account.status === "Active" && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={anyActionRunning}
                          onClick={() => handleStatusChange(account.id, "Suspended")}
                        >
                          Disable
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
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
                          size="sm"
                          disabled={anyActionRunning}
                          onClick={() => handleStatusChange(account.id, "Active")}
                        >
                          Enable
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
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
                        size="sm"
                        disabled={anyActionRunning}
                        onClick={() => handleStatusChange(account.id, "Active")}
                      >
                        Unlock
                      </Button>
                    )}
                    {account.status === "Pending" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={anyActionRunning}
                        onClick={() => handleStatusChange(account.id, "Active")}
                      >
                        Enable
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={anyActionRunning}
                      onClick={() =>
                        resetPasswordAccountId === account.id ? cancelPasswordReset() : startPasswordReset(account.id)
                      }
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={anyActionRunning}
                      onClick={() =>
                        deleteConfirmAccountId === account.id ? cancelDeleteConfirm() : startDeleteConfirm(account.id)
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </Td>
              </Tr>

              {resetPasswordAccountId === account.id && (
                <Tr>
                  <Td colSpan={4} className="bg-void/20">
                    <form
                      onSubmit={(e) => handlePasswordResetSubmit(e, account.id)}
                      className="flex flex-wrap items-end gap-3"
                    >
                      <FormField
                        label="Temporary Password"
                        htmlFor={`reset-password-${account.id}`}
                        className="flex-1 min-w-45"
                      >
                        <Input
                          id={`reset-password-${account.id}`}
                          type="password"
                          value={resetPasswordValue}
                          onChange={(e) => setResetPasswordValue(e.target.value)}
                          required
                        />
                      </FormField>
                      <Button type="submit" size="sm" disabled={anyActionRunning}>
                        {resettingPassword ? "Resetting…" : "Submit"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={anyActionRunning}
                        onClick={cancelPasswordReset}
                      >
                        Cancel
                      </Button>
                      {resetPasswordError && <p className="text-ember text-xs w-full">{resetPasswordError}</p>}
                    </form>
                  </Td>
                </Tr>
              )}

              {deleteConfirmAccountId === account.id && (
                <Tr>
                  <Td colSpan={4} className="bg-void/20">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-parchment-dim text-xs flex-1 min-w-45">
                        Delete {account.displayName}'s account? This cannot be undone.
                      </p>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={anyActionRunning}
                        onClick={() => handleConfirmDelete(account.id)}
                      >
                        {deletingAccount ? "Deleting…" : "Confirm Delete"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={anyActionRunning}
                        onClick={cancelDeleteConfirm}
                      >
                        Cancel
                      </Button>
                      {deleteError && <p className="text-ember text-xs w-full">{deleteError}</p>}
                    </div>
                  </Td>
                </Tr>
              )}
            </Fragment>
          ))}
          {accounts.length === 0 && <TableEmptyRow colSpan={4}>No accounts on file yet.</TableEmptyRow>}
        </Tbody>
      </Table>

      <ProfileSection title="Create Account" icon={UserPlus}>
        <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Display Name" htmlFor="new-account-display-name">
              <Input
                id="new-account-display-name"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Email" htmlFor="new-account-email">
              <Input
                id="new-account-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Temporary Password" htmlFor="new-account-password">
              <Input
                id="new-account-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Role" htmlFor="new-account-role">
              <Select
                id="new-account-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AccountRole })}
              >
                {ACCOUNT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
            </FormField>
            {form.role === "student" && (
              <FormField label="Academic Year" htmlFor="new-account-year">
                <Select
                  id="new-account-year"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) as (typeof YEARS)[number] })}
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
            {form.role === "student" && form.year >= 2 && (
              <FormField label="House" htmlFor="new-account-house">
                <Select
                  id="new-account-house"
                  value={form.house}
                  onChange={(e) => setForm({ ...form, house: e.target.value as House })}
                >
                  {HOUSES.map((house) => (
                    <option key={house} value={house}>
                      {house}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          </div>

          {formError && <p className="text-ember text-xs">{formError}</p>}

          <div>
            <Button type="submit" disabled={creatingAccount}>
              {creatingAccount ? "Creating…" : "Create Account"}
            </Button>
          </div>
        </form>
      </ProfileSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Permission Editor" icon={KeyRound}>
          <p className="text-parchment-dim text-sm">Fine-tune exactly what each role is allowed to do.</p>
        </ProfileSection>

        <ProfileSection title="Role Templates" icon={LayoutTemplate}>
          <p className="text-parchment-dim text-sm">
            Standard permission sets for Student, Professor, Admin, and staff roles.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}
