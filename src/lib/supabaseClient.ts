import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables! Check your .env file.");
}

// Safely create client or return a minimal mock to prevent white-screen crash on load.
// The app will still likely fail when trying to fetch data, but ErrorBoundary can catch it.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ order: () => ({ limit: () => ({ single: () => ({ maybeSingle: () => ({}) }) }) }) }),
      }),
    } as any;
