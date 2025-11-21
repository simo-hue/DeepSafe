'use client';

import Link from 'next/link';
import { Heart, Flame } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export function Header() {
    const { lives, streak } = useUserStore();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8">
                            <img
                                src="/icon.svg"
                                alt="Deepsafe Logo"
                                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(102,252,241,0.5)] transition-transform group-hover:scale-110"
                            />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-[#66FCF1] group-hover:text-[#45A29E] transition-colors">Deepsafe</span>
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-orange-500">
                        <Flame className="w-5 h-5 fill-current" />
                        <span className="font-bold">{streak}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-red-500">
                        <Heart className="w-5 h-5 fill-current" />
                        <span className="font-bold">{lives}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
