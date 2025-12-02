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
    const borderColor = isLegendary ? "border-amber-500" : isRare ? "border-cyber-purple" : "border-cyber-blue";
    const bgColor = isLegendary ? "bg-amber-500/10" : isRare ? "bg-cyber-purple/10" : "bg-cyber-blue/5";
    const textColor = isLegendary ? "text-amber-500" : isRare ? "text-cyber-purple" : "text-cyber-blue";
    const iconBg = isLegendary ? "bg-amber-500/20" : isRare ? "bg-cyber-purple/20" : "bg-cyber-blue/20";

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(badge)}
            className={cn(
                "relative p-4 rounded-xl border transition-all duration-300 overflow-hidden group w-full cursor-pointer",
                badge.is_unlocked
                    ? `${borderColor} ${bgColor} shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(102,252,241,0.2)]`
                    : "border-cyber-gray/30 bg-cyber-dark/50 opacity-60 grayscale"
            )}
        >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(69,162,158,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(69,162,158,0.5)_1px,transparent_1px)] bg-[size:20px_20px]" />

            <div className="relative z-10 flex items-center gap-4">
                {/* Icon Box */}
                <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-2xl border border-white/10",
                    badge.is_unlocked ? iconBg : "bg-cyber-gray/20"
                )}>
                    {badge.is_unlocked ? badge.icon_url : <Lock className="w-5 h-5 text-zinc-500" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className={cn(
                        "font-bold font-orbitron tracking-wide truncate",
                        badge.is_unlocked ? "text-white" : "text-zinc-500"
                    )}>
                        {badge.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                            "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded",
                            badge.is_unlocked ? `${iconBg} ${textColor}` : "bg-zinc-800 text-zinc-500"
                        )}>
                            {badge.rarity === 'legendary' ? 'Leggendario' : badge.rarity === 'rare' ? 'Raro' : 'Comune'}
                        </span>
                        {badge.is_unlocked && (
                            <span className="text-[10px] text-cyber-green font-mono">
                                +{badge.xp_bonus} XP
                            </span>
                        )}
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-end justify-center">
                    {badge.is_unlocked ? (
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", textColor.replace('text-', 'bg-'))} />
                    ) : (
                        <Lock className="w-4 h-4 text-zinc-600" />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
