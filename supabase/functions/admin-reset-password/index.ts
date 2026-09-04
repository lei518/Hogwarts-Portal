// Admin Portal Foundation - Administrator-Initiated Password Reset (Phase 6F).
//
// Same reason this has to be a server-side Edge Function as
// admin-create-account and admin-update-account-status: setting another
// user's Auth password requires the Admin API (`auth.admin.updateUserById`),
// which requires service_role - a key that must never reach the browser.
// This function is the privileged boundary itself, so - exactly like its
// two siblings - it re-verifies the caller is an active admin from their
// own JWT before touching the service-role client; it never trusts that
// RoleGate or any client-side role check already gated the request.
//
// This is an ADMINISTRATOR-INITIATED reset: the admin chooses the new
// password and it takes effect immediately. It is deliberately not the
// "forgot password" email/recovery-link flow (out of scope this
// milestone) - there is no email sent, no token, no self-service path.
//
// Deploy with the Supabase CLI once this project is linked:
//   supabase functions deploy admin-reset-password
// No manual secret configuration is required - SUPABASE_URL,
// SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are auto-injected into
// every deployed function's environment by the platform. This file is
// authored as part of this milestone but is NOT deployed by this change -
// deploying to a live Supabase project is a separate, explicit action for
// whoever owns that project.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const MIN_PASSWORD_LENGTH = 8;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

// Deliberately simple, matching admin-create-account's own password check -
// this is a temporary password an admin hands to someone directly, not a
// public signup form; a length floor plus a "not trivially guessable"
// check is enough without inventing a second, stricter policy nothing else
// in this project uses.
const WEAK_PASSWORDS = new Set([
  "password",
  "password1",
  "12345678",
  "123456789",
  "qwertyui",
  "letmein1",
  "changeme",
]);

function isWeakPassword(password: string): boolean {
  return WEAK_PASSWORDS.has(password.toLowerCase());
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
    return jsonResponse({ error: "Server is not configured for password resets." }, 500);
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
    return jsonResponse({ error: "Only an active administrator can reset a password." }, 403);
  }

  let payload: { userId?: unknown; newPassword?: unknown };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  if (!isUuid(payload.userId)) {
    return jsonResponse({ error: "A valid account is required." }, 400);
  }
  const targetUserId = payload.userId;

  const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";
  if (!newPassword) {
    return jsonResponse({ error: "A new password is required." }, 400);
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return jsonResponse({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, 400);
  }
  if (isWeakPassword(newPassword)) {
    return jsonResponse({ error: "That password is too easy to guess. Choose a stronger one." }, 400);
  }

  // Same self-action guard as admin-update-account-status: an admin
  // resetting their own password through this administrator-only path
  // (rather than their own account settings) is not a legitimate use of
  // this endpoint, and blocking it removes an easy way to bypass whatever
  // password policy the admin's own sign-in normally goes through.
  if (targetUserId === callerData.user.id) {
    return jsonResponse({ error: "You cannot reset your own password here." }, 400);
  }

  // Privileged client - service_role, held only in this server-side
  // environment, never returned to or reachable from the browser.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: updated, error: updateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
    password: newPassword,
  });

  if (updateError || !updated.user) {
    return jsonResponse({ error: updateError?.message ?? "Could not reset the account's password." }, 500);
  }

  return jsonResponse({ userId: updated.user.id }, 200);
});
