// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (_client) return _client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase configuration', { supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
        console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log("SUPABASE KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0,5));
        throw new Error('Missing Supabase configuration');
    }

    _client = createClient(supabaseUrl, supabaseAnonKey);
    return _client;
}