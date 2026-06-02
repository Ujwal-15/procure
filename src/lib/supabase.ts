import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/* Returns null if env vars aren't set yet — DataContext handles gracefully */
export const supabase = url && key ? createClient(url, key) : null;
