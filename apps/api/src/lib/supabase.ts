import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  // Fail loudly rather than silently continuing with an unconfigured client —
  // per the ruleset's anti-hallucination rules, a missing resource is a
  // blocker, not something to route around.
  console.warn(
    "[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. " +
      "Server-side Supabase calls will fail until apps/api/.env is filled in."
  );
}

export const supabaseAdmin = createClient(url ?? "", serviceRoleKey ?? "", {
  auth: { persistSession: false }
});
