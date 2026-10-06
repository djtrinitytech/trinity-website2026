import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project-id.supabase.co" &&
    !supabaseUrl.includes("your-project-id")
  );
};

// Initialize client with public anonymous credentials only
// Service-role key is strictly prohibited on the client side
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient(
      "https://placeholder.supabase.co",
      "placeholder-anon-key-set-up-env-vars",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
