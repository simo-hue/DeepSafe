'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Trophy, LayoutGrid, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            icon: Map,
            label: 'Home',
            href: '/dashboard',
            activeColor: 'text-cyber-blue'
        },
        {
            icon: Trophy,
            label: 'Leaderboard',
            href: '/leaderboard',
            activeColor: 'text-yellow-500'
        },
        {
            icon: LayoutGrid,
            label: 'Vault',
            href: '/achievements',
            activeColor: 'text-cyber-purple'
        },
        {
            icon: User,
            label: 'Profile',
            href: '/profile',
            activeColor: 'text-cyber-green'
        },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-[100] pointer-events-none">
            {/* Floating Glass Capsule */}
            <div className="glass-panel rounded-full px-2 py-2 flex items-center gap-2 pointer-events-auto bg-cyber-dark/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative group"
                        >
                            <div className={cn(
                                "relative flex flex-col items-center justify-center w-16 h-14 rounded-full transition-all duration-300",
                                isActive ? "bg-white/5" : "hover:bg-white/5"
                            )}>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute inset-0 bg-cyber-blue/10 blur-md rounded-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <div className="relative z-10 flex flex-col items-center gap-1">
                                    <motion.div
                                        animate={{ y: isActive ? -2 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                    >
                                        <item.icon
                                            className={cn(
                                                "w-6 h-6 transition-all duration-300",
                                                isActive
                                                    ? cn(item.activeColor, "drop-shadow-[0_0_8px_currentColor]")
                                                    : "text-cyber-gray group-hover:text-zinc-300"
                                            )}
                                        />
                                    </motion.div>

                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-dot"
                                            className={cn(
                                                "w-1 h-1 rounded-full shadow-[0_0_5px_currentColor]",
                                                item.activeColor.replace('text-', 'bg-')
                                            )}
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
