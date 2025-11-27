'use client';

import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { Logo } from '@/components/ui/Logo';

export function Header() {
    const { lives, streak } = useUserStore();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Logo size="sm" showText />
                    </Link>
                </div>


            </div>
        </header>
    );
}
