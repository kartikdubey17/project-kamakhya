import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This will help you debug in the browser console
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase variables are missing! Check Vercel/Env settings.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);