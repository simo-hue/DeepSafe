'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Trophy, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useHaptics } from '@/hooks/useHaptics';

export function BottomNav() {
    const pathname = usePathname();
    const { trigger } = useHaptics();

    // Hide BottomNav on quiz pages for immersion and to prevent overlay issues
    if (pathname?.startsWith('/quiz')) return null;

    const navItems = [
        { id: 'home', icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
        { id: 'leaderboard', icon: Trophy, label: 'Classifica', path: '/leaderboard' },
        { id: 'shop', icon: ShoppingBag, label: 'Negozio', path: '/shop' },
        { id: 'profile', icon: User, label: 'Profilo', path: '/profile' },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-[100] pointer-events-none pb-[env(safe-area-inset-bottom)]">
            {/* Floating Glass Capsule */}
            <div className="relative flex items-center gap-1 pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full p-1.5 shadow-2xl">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => trigger('light')}
                            className="relative group"
                        >
                            <div className={cn(
                                "relative flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all duration-300",
                                isActive ? "bg-slate-800/50" : "hover:bg-slate-800/30"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute inset-0 bg-cyan-500/10 blur-md rounded-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <div className="relative z-10 flex flex-col items-center gap-1">
                                    <motion.div
                                        animate={{ y: isActive ? -1 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                    >
                                        <item.icon
                                            className={cn(
                                                "w-5 h-5 transition-all duration-300",
                                                isActive
                                                    ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                                                    : "text-slate-400 group-hover:text-slate-200"
                                            )}
                                        />
                                    </motion.div>

                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-dot"
                                            className="w-1 h-1 rounded-full shadow-[0_0_5px_currentColor] bg-cyan-400"
                                        />
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
