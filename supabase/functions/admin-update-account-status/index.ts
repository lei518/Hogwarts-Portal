// Admin Portal Foundation - Account Status Updates (Phase 6E).
//
// Same reason this has to be a server-side Edge Function as
// supabase/functions/admin-create-account/index.ts: updating another
// user's `profiles` row requires service_role (RLS's "own profile" policy
// in supabase/schema.sql only lets a client update their own row), and
// that key must never reach the browser. This function is the privileged
// boundary itself, so - exactly like admin-create-account - it re-verifies
// the caller is an active admin from their own JWT before touching the
// service-role client; it never trusts that RoleGate already gated the
// request, since a network endpoint can be called directly.
//
// Deploy with the Supabase CLI once this project is linked:
//   supabase functions deploy admin-update-account-status
// No manual secret configuration is required - SUPABASE_URL,
// SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are auto-injected into
// every deployed function's environment by the platform. This file is
// authored as part of this milestone but is NOT deployed by this change
// alone - deploying to a live Supabase project is a separate action for
// whoever owns that project.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const ALLOWED_STATUSES = ["Active", "Disabled", "Locked"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return typeof value === "string" && (ALLOWED_STATUSES as readonly string[]).includes(value);
}

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
    return jsonResponse({ error: "Server is not configured for account status updates." }, 500);
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
    return jsonResponse({ error: "Only an active administrator can change account status." }, 403);
  }

  let payload: { userId?: unknown; status?: unknown };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  if (!isUuid(payload.userId)) {
    return jsonResponse({ error: "A valid account is required." }, 400);
  }
  if (!isAllowedStatus(payload.status)) {
    return jsonResponse({ error: "Status must be Active, Disabled, or Locked." }, 400);
  }
  const targetUserId = payload.userId;
  const status = payload.status;

  // An admin locking or disabling their own only account would sign
  // themselves out with no other admin able to undo it - the same
  // self-escalation spirit as the DB trigger, just for the mirror case.
  if (targetUserId === callerData.user.id) {
    return jsonResponse({ error: "You cannot change the status of your own account." }, 400);
  }

  // Privileged client - service_role, held only in this server-side
  // environment, never returned to or reachable from the browser.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: updated, error: updateError } = await adminClient
    .from("profiles")
    .update({ status })
    .eq("user_id", targetUserId)
    .select("user_id, display_name, role, status")
    .maybeSingle();

  if (updateError) {
    return jsonResponse({ error: `Could not update account status: ${updateError.message}` }, 500);
  }
  if (!updated) {
    return jsonResponse({ error: "No account found for that user." }, 404);
  }

  return jsonResponse(
    { userId: updated.user_id, displayName: updated.display_name, role: updated.role, status: updated.status },
    200
  );
});
