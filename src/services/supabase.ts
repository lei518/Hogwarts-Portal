import { createClient, FunctionsHttpError } from "@supabase/supabase-js";
import type { GameState } from "../types/game";
import { hydrateGameState } from "../utils/character";
import type { AccountRole } from "../types/adminPortal";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

function requireClient() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}

// Authentication Foundation (Phase 6A) - see
// supabase/migrations/0001_add_profile_role_and_active.sql.
export type UserRole = "student" | "professor" | "admin";

const USER_ROLES: readonly UserRole[] = ["student", "professor", "admin"];

// Defensive, not merely decorative: the DB's own CHECK constraint already
// restricts this column, but a value from the network is still untyped
// until narrowed here - anything unrecognized is treated as "no role"
// rather than trusted as one of the three literals.
function toUserRole(value: string): UserRole | null {
  return (USER_ROLES as string[]).includes(value) ? (value as UserRole) : null;
}

export interface CloudProfile {
  displayName: string;
  lastNameChangeAt: string; // ISO timestamp, as returned by Postgres
  role: UserRole | null;
  active: boolean;
}

export async function fetchCloudSave(userId: string): Promise<GameState | null> {
  const client = requireClient();
  const { data, error } = await client
    .from("saves")
    .select("game_state")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return hydrateGameState((data?.game_state as GameState | undefined) ?? null);
}

export async function upsertCloudSave(userId: string, state: GameState): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("saves")
    .upsert({ user_id: userId, game_state: state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

const PROFILE_COLUMNS = "display_name, last_name_change_at, role, active";

function toCloudProfile(data: {
  display_name: string;
  last_name_change_at: string;
  role: string;
  active: boolean;
}): CloudProfile {
  return {
    displayName: data.display_name,
    lastNameChangeAt: data.last_name_change_at,
    role: toUserRole(data.role),
    active: data.active,
  };
}

export async function fetchProfile(userId: string): Promise<CloudProfile | null> {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return toCloudProfile(data);
}

export async function createProfile(userId: string, displayName: string): Promise<CloudProfile> {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .insert({ user_id: userId, display_name: displayName })
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return toCloudProfile(data);
}

// Throws (including on the cooldown trigger firing) — the caller decides how to recover.
export async function updateProfileName(userId: string, newName: string): Promise<CloudProfile> {
  const client = requireClient();
  const { data, error } = await client
    .from("profiles")
    .update({ display_name: newName })
    .eq("user_id", userId)
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return toCloudProfile(data);
}

// Admin Account Creation (Phase 6D). Creating another user's Auth account
// and a profiles row for a user_id that isn't the caller's own both
// require service_role - a key this client is never given (see
// supabase/functions/admin-create-account/index.ts's own comment on why).
// This client-side call only ever carries the anon key plus the current
// admin's own session token (functions.invoke forwards it automatically);
// the Edge Function is the actual privileged boundary and re-checks the
// caller is an active admin itself, so nothing here can be trusted to
// "already be gated by RoleGate" - it isn't, by design.
export interface AdminCreateAccountInput {
  displayName: string;
  email: string;
  password: string;
  role: AccountRole;
}

export interface AdminCreateAccountResult {
  userId: string;
  displayName: string;
  role: AccountRole;
}

async function extractFunctionErrorMessage(error: unknown): Promise<string | null> {
  if (!(error instanceof FunctionsHttpError)) return null;
  try {
    const body = await error.context.json();
    return typeof body?.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}

export async function adminCreateAccount(input: AdminCreateAccountInput): Promise<AdminCreateAccountResult> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-create-account", { body: input });
  if (error) {
    const message = (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not create the account.";
    throw new Error(message);
  }
  if (!data?.userId) {
    throw new Error("Account creation did not return a user id.");
  }
  return { userId: data.userId, displayName: data.displayName, role: data.role };
}

// Account Status (Phase 6E). Same shape as adminCreateAccount above -
// updating another user's profiles.status requires service_role, so this
// client call only ever carries the anon key + the current admin's own
// session token, and supabase/functions/admin-update-account-status is
// the actual privileged boundary (see its own comment).
export type ProfileAccountStatus = "Active" | "Disabled" | "Locked";

export interface AdminUpdateAccountStatusResult {
  userId: string;
  displayName: string;
  role: AccountRole;
  status: ProfileAccountStatus;
}

export async function adminUpdateAccountStatus(
  userId: string,
  status: ProfileAccountStatus
): Promise<AdminUpdateAccountStatusResult> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-update-account-status", {
    body: { userId, status },
  });
  if (error) {
    const message =
      (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not update the account's status.";
    throw new Error(message);
  }
  if (!data?.userId) {
    throw new Error("Status update did not return an account.");
  }
  return { userId: data.userId, displayName: data.displayName, role: data.role, status: data.status };
}

// Administrator-Initiated Password Reset (Phase 6F). Same shape as
// adminCreateAccount/adminUpdateAccountStatus above - setting another
// user's Auth password requires service_role, so this client call only
// ever carries the anon key + the current admin's own session token, and
// supabase/functions/admin-reset-password is the actual privileged
// boundary (see its own comment). Not the "forgot password" email flow -
// the admin chooses the new password directly.
export async function adminResetPassword(userId: string, newPassword: string): Promise<void> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-reset-password", {
    body: { userId, newPassword },
  });
  if (error) {
    const message =
      (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not reset the account's password.";
    throw new Error(message);
  }
  if (!data?.userId) {
    throw new Error("Password reset did not return an account.");
  }
}

// Account Deletion (Phase 6G). Same shape as adminCreateAccount/
// adminUpdateAccountStatus/adminResetPassword above - deleting another
// user's Auth account requires service_role, so this client call only
// ever carries the anon key + the current admin's own session token, and
// supabase/functions/admin-delete-account is the actual privileged
// boundary (see its own comment on how it guarantees no orphaned data).
export async function adminDeleteAccount(userId: string): Promise<void> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-delete-account", { body: { userId } });
  if (error) {
    const message =
      (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not delete the account.";
    throw new Error(message);
  }
  if (!data?.userId) {
    throw new Error("Account deletion did not return a confirmation.");
  }
}

// Real Account Listing (Phase 6I). Same shape as the four functions
// above - listing every account is a cross-user read that RLS's "own
// profile" policy blocks for a plain client query, so this requires
// service_role too, and supabase/functions/admin-list-accounts is the
// actual privileged boundary (see its own comment). Replaces the seeded
// adminUserAccounts array as User Administration's account source.
export interface AdminAccountRow {
  userId: string;
  displayName: string;
  role: AccountRole;
  status: ProfileAccountStatus;
}

export async function adminListAccounts(): Promise<AdminAccountRow[]> {
  const client = requireClient();
  const { data, error } = await client.functions.invoke("admin-list-accounts", { method: "GET" });
  if (error) {
    const message = (await extractFunctionErrorMessage(error)) ?? error.message ?? "Could not load accounts.";
    throw new Error(message);
  }
  if (!Array.isArray(data?.accounts)) {
    throw new Error("Account listing did not return an account list.");
  }
  return data.accounts;
}
