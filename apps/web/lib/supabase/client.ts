"use client";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Browser-side client for the base auth flow (sign up / sign in / sign out).
// This intentionally keeps things simple for the scaffold — swapping to
// @supabase/ssr for server-synced sessions is a reasonable future
// improvement, not required for this session's scope.
export const supabase = createClient(url, anonKey);
