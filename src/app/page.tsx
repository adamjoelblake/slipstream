'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import Auth from '@/components/Auth';
import TaskManager from '@/components/TaskManager';

export default function Home() {
    const supabase = getSupabaseClient(); // safe: this file is client-side
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (!session) return <Auth />;
    return <TaskManager />;
}