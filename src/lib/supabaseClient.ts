import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://ovlemcggrwpyaydsxzqx.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bGVtY2dncndweWF5ZHN4enF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODMyNzYsImV4cCI6MjA3NjM1OTI3Nn0.IbrzOknQmYUqORFn8MMnxouo5jtdDQbUkLaWzGm3oQM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);