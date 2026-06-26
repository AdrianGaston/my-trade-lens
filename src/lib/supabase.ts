import { createClient } from "@supabase/supabase-js";

// Publishable (anon) key – safe to ship in client code.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://egyvvcnbevlmcowdibry.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_AHgZFudANbdrLyck7j4F8A_gkG89nJs";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
