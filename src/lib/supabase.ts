import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase configuration:', {
            supabaseUrl,
            supabaseAnonKey: supabaseAnonKey ? 'provided' : 'missing',
        });
        throw new Error('Missing Supabase configuration');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
}