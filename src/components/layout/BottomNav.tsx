'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
        { icon: ShoppingBag, label: 'Shop', href: '/shop' },
        { icon: User, label: 'Profile', href: '/profile' }, // Redirect to login for now as profile
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-10 h-10"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute inset-0 bg-cyber-blue/20 blur-md rounded-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <item.icon
                                className={cn(
                                    "w-6 h-6 transition-all duration-300 relative z-10",
                                    isActive
                                        ? "text-cyber-blue drop-shadow-[0_0_8px_rgba(69,162,158,0.8)]"
                                        : "text-cyber-gray hover:text-cyber-blue/70"
                                )}
                            />
                            {isActive && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute -bottom-1 w-1 h-1 bg-cyber-blue rounded-full shadow-[0_0_5px_#45A29E]"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
