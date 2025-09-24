import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not set in environment variables.');
  // In a production Next.js app, you might want to throw an error or handle this more gracefully.
  // For development, console.error is sufficient.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
