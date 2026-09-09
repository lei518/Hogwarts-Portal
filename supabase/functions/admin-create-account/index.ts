// Admin Portal Foundation - Account Creation (Phase 6D).
//
// Why this has to be a server-side Edge Function, not a client call:
// creating another user's Supabase Auth account and inserting a profile
// row for a user_id that isn't the caller's own both require the
// `service_role` key. That key must never reach the browser bundle - a
// leaked service_role key is a full database bypass (it ignores every RLS
// policy, including the "own profile" policy this project already relies
// on - see supabase/schema.sql). Supabase Edge Functions are the
// project's existing backend capability for exactly this: they run
// server-side, and the platform injects SUPABASE_URL, SUPABASE_ANON_KEY,
// and SUPABASE_SERVICE_ROLE_KEY as environment variables automatically
// for every deployed function - no secret has to be configured or checked
// into this repo.
//
// This function is the privileged boundary itself, so it re-checks the
// caller's identity independently of the client's own RoleGate/AuthContext
// (which only gate the UI, not the network): the caller's own JWT is
// verified with the anon-key client below, and only proceeds if that
// caller's own `profiles` row has role = 'admin' and active = true. A
// non-admin (or a request with no/garbled token) is rejected before the
// service-role client is ever touched.
//
// Deploy with the Supabase CLI once this project is linked:
//   supabase functions deploy admin-create-account
// No manual secret configuration is required (see above). This file is
// authored as part of this milestone but is NOT deployed by this change
// alone - deploying to a live Supabase project is an explicit, separate
// action for whoever owns that project.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const ALLOWED_ROLES = ["student", "professor", "admin", "librarian", "healer", "caretaker", "deputy_headmaster"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function isAllowedRole(value: unknown): value is AllowedRole {
  return typeof value === "string" && (ALLOWED_ROLES as readonly string[]).includes(value);
}

const ALLOWED_HOUSES = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"] as const;
type AllowedHouse = (typeof ALLOWED_HOUSES)[number];

function isAllowedHouse(value: unknown): value is AllowedHouse {
  return typeof value === "string" && (ALLOWED_HOUSES as readonly string[]).includes(value);
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
    // Misconfiguration, not a caller error - never leaks which key is missing.
    return jsonResponse({ error: "Server is not configured for account creation." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization." }, 401);
  }

  // Caller-scoped client: only the anon key + the caller's own JWT, so
  // this can never do more than the caller themselves is allowed to do
  // under RLS - it exists purely to answer "who is calling, and are they
  // an active admin?"
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
    return jsonResponse({ error: "Only an active administrator can create accounts." }, 403);
  }

  let payload: {
    displayName?: unknown;
    email?: unknown;
    password?: unknown;
    role?: unknown;
    year?: unknown;
    house?: unknown;
  };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const displayName = typeof payload.displayName === "string" ? payload.displayName.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!displayName || !email || !password) {
    return jsonResponse({ error: "Display name, email, and password are all required." }, 400);
  }
  if (password.length < 8) {
    return jsonResponse({ error: "Temporary password must be at least 8 characters." }, 400);
  }
  if (!isAllowedRole(payload.role)) {
    return jsonResponse({ error: `Role must be one of: ${ALLOWED_ROLES.join(", ")}.` }, 400);
  }
  const role = payload.role;

  // Year-Based Onboarding (Phase 6L) - `year` drives which onboarding
  // ceremony (if any) the student sees on first login (see
  // src/journey/getJourneyStage.ts); `house` is only meaningful for an
  // already-enrolled (Year 2-7) student - a Year 1 student's house comes
  // from the existing Sorting Hat ceremony instead, never from the admin.
  let year: number | null = null;
  let house: AllowedHouse | null = null;

  if (role === "student") {
    if (typeof payload.year !== "number" || !Number.isInteger(payload.year) || payload.year < 1 || payload.year > 7) {
      return jsonResponse({ error: "Academic year (1-7) is required for a student account." }, 400);
    }
    year = payload.year;

    if (year === 1) {
      if (payload.house !== undefined && payload.house !== null) {
        return jsonResponse({ error: "Year 1 students receive their house from the Sorting Hat, not here." }, 400);
      }
    } else {
      if (!isAllowedHouse(payload.house)) {
        return jsonResponse({ error: "House is required for a Year 2-7 student account." }, 400);
      }
      house = payload.house;
    }
  } else if (payload.year !== undefined || payload.house !== undefined) {
    return jsonResponse({ error: "Academic year and house only apply to student accounts." }, 400);
  }

  // Privileged client - service_role, held only in this server-side
  // environment, never returned to or reachable from the browser.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // this project's Auth settings run with email confirmation off (see schema.sql); explicit here so a freshly created account can sign in immediately.
  });

  if (createError || !created.user) {
    const message = /already.*registered|already.*exists/i.test(createError?.message ?? "")
      ? "An account with that email already exists."
      : createError?.message ?? "Could not create the account.";
    return jsonResponse({ error: message }, 409);
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .insert({ user_id: created.user.id, display_name: displayName, role, active: true, year, house });

  if (profileError) {
    // Do not leave an orphaned Auth user with no profile row - undo the
    // half-finished creation and report the real failure honestly.
    await adminClient.auth.admin.deleteUser(created.user.id);
    return jsonResponse({ error: `Account was not created: ${profileError.message}` }, 500);
  }

  return jsonResponse({ userId: created.user.id, displayName, role, year, house }, 200);
});
