// Admin Portal Foundation - Real Account Listing (Phase 6I).
//
// User Administration used to render the seeded adminUserAccounts array
// (data/adminPortal.ts). This is what replaces that: the real accounts
// created through Phases 6D-6H (admin-created and self-service signups
// alike) all live as rows in public.profiles, but this project's RLS
// policy on that table is `using (auth.uid() = user_id)` (see
// supabase/schema.sql) - a client can only ever read its OWN row. Listing
// every account is therefore a cross-user read that requires
// service_role, same reason every other admin-* function in this project
// is server-side (see admin-create-account/index.ts's own comment). This
// function re-verifies the caller is an active admin from their own JWT
// before touching the service-role client - it never trusts RoleGate or
// any client-side check.
//
// Deploy with the Supabase CLI once this project is linked:
//   supabase functions deploy admin-list-accounts
// No manual secret configuration is required - SUPABASE_URL,
// SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are auto-injected into
// every deployed function's environment by the platform. This file is
// authored as part of this milestone but is NOT deployed by this change -
// deploying to a live Supabase project is a separate, explicit action for
// whoever owns that project.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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

  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "Server is not configured for account listing." }, 500);
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
    return jsonResponse({ error: "Only an active administrator can list accounts." }, 403);
  }

  // Privileged client - service_role, held only in this server-side
  // environment, never returned to or reachable from the browser.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: rows, error: listError } = await adminClient
    .from("profiles")
    .select("user_id, display_name, role, status")
    .order("display_name", { ascending: true });

  if (listError) {
    return jsonResponse({ error: `Could not list accounts: ${listError.message}` }, 500);
  }

  const accounts = (rows ?? []).map((row) => ({
    userId: row.user_id,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
  }));

  return jsonResponse({ accounts }, 200);
});
