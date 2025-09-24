import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not set in NEXT_PUBLIC_ environment variables. Check your .env.local file.');
    console.log("Supabase URL at build:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Supabase Key at build:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 6) + "...");
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

