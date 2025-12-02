'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/dashboard';

    const called = useRef(false);

    useEffect(() => {
        const handleCallback = async () => {
            if (code && !called.current) {
                called.current = true;

                const supabase = createBrowserClient<Database>(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { error } = await supabase.auth.exchangeCodeForSession(code);

                if (!error) {
                    router.push(next);
                } else {
                    console.error('Auth error:', error);
                    // Only redirect to error if it's a genuine failure, not a race condition
                    // But with the ref check, we should be safe.
                    router.push(`/login?error=auth_code_error&message=${encodeURIComponent(error.message)}`);
                }
            } else if (!code) {
                router.push('/login');
            }
        };

        handleCallback();
    }, [code, next, router]);

    return (
        <div className="animate-pulse">Autenticazione in corso...</div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-cyber-dark text-cyber-blue">
            <Suspense fallback={<div>Caricamento...</div>}>
                <AuthCallbackContent />
            </Suspense>
        </div>
    );
}
