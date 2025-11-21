'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    category: string;
    xp_bonus: number;
    is_unlocked: boolean;
    earned_at?: string;
    rarity?: 'common' | 'rare' | 'legendary';
}

interface BadgeCardProps {
    badge: Badge;
    onClick: (badge: Badge) => void;
}

export function BadgeCard({ badge, onClick }: BadgeCardProps) {
    const isLegendary = badge.rarity === 'legendary';
    const isRare = badge.rarity === 'rare';

    // Colors based on rarity
    const borderColor = isLegendary ? "bg-amber-500" : isRare ? "bg-cyber-purple" : "bg-cyber-blue";
    const glowColor = isLegendary ? "shadow-amber-500/50" : isRare ? "shadow-cyber-purple/50" : "shadow-cyber-blue/50";

    return (
        <motion.div
            whileHover={{ scale: 1.1, zIndex: 20 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick(badge)}
            className={cn(
                "relative w-[100px] h-[115px] cursor-pointer group flex items-center justify-center",
                badge.is_unlocked ? "opacity-100" : "opacity-40 grayscale"
            )}
        >
            {/* 1. Outer Hexagon (The Border) */}
            <div
                className={cn(
                    "absolute inset-0 transition-all duration-300",
                    badge.is_unlocked ? borderColor : "bg-cyber-gray",
                    badge.is_unlocked && "group-hover:shadow-[0_0_15px_currentColor]"
                )}
                style={{
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                }}
            >
                {/* Gradient Overlay for Border */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </div>

            {/* 2. Inner Hexagon (The Content) */}
            <div
                className="absolute inset-[2px] bg-cyber-dark flex flex-col items-center justify-center z-10"
                style={{
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                }}
            >
                {/* Background Gradient inside content */}
                <div className={cn(
                    "absolute inset-0 opacity-20",
                    badge.is_unlocked
                        ? `bg-gradient-to-br ${isLegendary ? "from-amber-500" : isRare ? "from-cyber-purple" : "from-cyber-blue"} to-transparent`
                        : "bg-cyber-gray"
                )} />

                {/* Icon */}
                <div className="relative z-10 text-3xl mb-1 transform transition-transform group-hover:scale-110">
                    {badge.is_unlocked ? badge.icon_url : <Lock className="w-6 h-6 text-zinc-600" />}
                </div>

                {/* Rarity Dot */}
                {badge.is_unlocked && (
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1 shadow-[0_0_5px_currentColor]",
                        isLegendary ? "bg-amber-500 text-amber-500" : isRare ? "bg-cyber-purple text-cyber-purple" : "bg-cyber-blue text-cyber-blue"
                    )} />
                )}
            </div>
        </motion.div>
    );
}
