// Standard Supabase CORS headers, shared by every admin-* Edge Function.
// A directory prefixed with `_` is not deployed as its own function - the
// Supabase CLI skips it - so this is imported by relative path from each
// function's own index.ts rather than duplicated five times.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
