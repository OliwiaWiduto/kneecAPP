import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export function createClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseKey());
}

export function tryCreateBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient();
}
