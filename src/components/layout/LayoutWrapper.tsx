'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { CyberToast } from "@/components/ui/CyberToast";
import { SystemModal } from "@/components/ui/SystemModal";
import { GiftOverlay } from '@/components/gamification/GiftOverlay';

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    React.useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/custom-sw.js').then(
                (registration) => console.log('Service Worker registered with scope:', registration.scope),
                (error) => console.error('Service Worker registration failed:', error)
            );
        }
    }, []);

    return (
        <div className={`min-h-screen flex flex-col relative overflow-hidden ${isAdmin ? 'w-full' : 'max-w-md mx-auto pt-24 pb-24'}`}>
            {!isAdmin && <Header />}
            <main className={`flex-1 z-10 ${isAdmin ? 'p-0' : 'p-4'}`}>
                {children}
            </main>
            {!isAdmin && <BottomNav />}
            <CyberToast />
            <SystemModal />
            <GiftOverlay />
        </div>
    );
};
