// Admin Portal Foundation - Account Deletion (Phase 6G).
//
// Same reason this has to be a server-side Edge Function as its three
// siblings (admin-create-account, admin-update-account-status,
// admin-reset-password): deleting another user's Auth account requires
// the Admin API, which requires service_role - a key that must never
// reach the browser. This function is the privileged boundary itself, so
// it re-verifies the caller is an active admin from their own JWT before
// touching the service-role client; it never trusts that RoleGate or any
// client-side role check already gated the request.
//
// How "never leave orphaned data" is actually guaranteed here: this
// project's public.profiles.user_id is `references auth.users(id) on
// delete cascade` (see supabase/schema.sql). Deleting the auth.users row
// is therefore a single, atomic Postgres operation that removes the
// matching profiles row in the same transaction - there is no network
// round trip between "delete the profile" and "delete the Auth user" for
// a partial failure to land in the middle of. This function deletes the
// Auth user first (letting that cascade do the real work), then makes one
// defensive, explicit profiles delete afterward - which is a harmless
// no-op if the cascade already removed the row, and a real safety net if
// it somehow didn't. If the Auth deletion itself fails, nothing has
// changed - the account still exists, and this returns an honest error
// rather than claiming success.
//
// Deploy with the Supabase CLI once this project is linked:
//   supabase functions deploy admin-delete-account
// No manual secret configuration is required - SUPABASE_URL,
// SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are auto-injected into
// every deployed function's environment by the platform. This file is
// authored as part of this milestone but is NOT deployed by this change -
// deploying to a live Supabase project is a separate, explicit action for
// whoever owns that project.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Server is not configured for account deletion." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization." }, 401);
  }

  // Caller-scoped client - only the anon key + the caller's own JWT.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !callerData.user) {
    return jsonResponse({ error: "Not signed in." }, 401);
  }

  const { data: callerProfile, error: callerProfileError } = await callerClient
    .from("profiles")
    .select("role, active")
    .eq("user_id", callerData.user.id)
    .maybeSingle();

  if (callerProfileError || !callerProfile || callerProfile.role !== "admin" || !callerProfile.active) {
    return jsonResponse({ error: "Only an active administrator can delete an account." }, 403);
  }

  let payload: { userId?: unknown };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  if (!isUuid(payload.userId)) {
    return jsonResponse({ error: "A valid account is required." }, 400);
  }
  const targetUserId = payload.userId;

  // Same self-action guard as admin-update-account-status and
  // admin-reset-password: an admin cannot delete the very account they're
  // signed in as through this administrator-only path.
  if (targetUserId === callerData.user.id) {
    return jsonResponse({ error: "You cannot delete your own account." }, 400);
  }

  // Privileged client - service_role, held only in this server-side
  // environment, never returned to or reachable from the browser.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: target, error: targetError } = await adminClient
    .from("profiles")
    .select("user_id, display_name")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (targetError) {
    return jsonResponse({ error: `Could not look up that account: ${targetError.message}` }, 500);
  }
  if (!target) {
    return jsonResponse({ error: "No account found for that user." }, 404);
  }

  // Deleting the Auth user cascades to delete its profiles row in the
  // same atomic Postgres operation (see this file's own comment) - if
  // this fails, nothing has changed and the error below is honest.
  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetUserId);
  if (deleteAuthError) {
    return jsonResponse({ error: `Could not delete the account: ${deleteAuthError.message}` }, 500);
  }

  // Defensive backstop, not a second point of failure: harmless no-op if
  // the cascade above already removed this row.
  await adminClient.from("profiles").delete().eq("user_id", targetUserId);

  return jsonResponse({ userId: target.user_id, displayName: target.display_name }, 200);
});
