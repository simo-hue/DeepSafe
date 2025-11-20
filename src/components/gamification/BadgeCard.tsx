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

    return (
        <motion.div
            whileHover={{ scale: 1.05, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick(badge)}
            className={cn(
                "relative w-24 h-28 cursor-pointer group",
                // Hexagon Clip Path
                "before:content-[''] before:absolute before:inset-0 before:bg-cyber-dark before:clip-path-hexagon",
                badge.is_unlocked ? "opacity-100" : "opacity-50 grayscale"
            )}
            style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }}
        >
            {/* Border/Background */}
            <div className={cn(
                "absolute inset-0.5",
                badge.is_unlocked
                    ? isLegendary
                        ? "bg-gradient-to-br from-amber-500/20 to-amber-900/20"
                        : "bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20"
                    : "bg-cyber-gray/20"
            )} />

            {/* Border Stroke (Simulated) */}
            <div className={cn(
                "absolute inset-0 border-2 pointer-events-none",
                badge.is_unlocked
                    ? isLegendary ? "border-amber-500" : "border-cyber-blue"
                    : "border-cyber-gray"
            )} style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }} />

            {/* Holographic Shine Effect */}
            {badge.is_unlocked && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                </div>
            )}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center z-10">
                {badge.is_unlocked ? (
                    <>
                        <div className="text-2xl mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            {badge.icon_url}
                        </div>
                        {isLegendary && (
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Particle effects could go here */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-500/10 blur-xl animate-pulse" />
                            </div>
                        )}
                    </>
                ) : (
                    <Lock className="w-8 h-8 text-cyber-gray" />
                )}
            </div>

            {/* Rarity Indicator (Bottom Dot) */}
            {badge.is_unlocked && (
                <div className={cn(
                    "absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]",
                    isLegendary ? "bg-amber-500 text-amber-500" :
                        badge.rarity === 'rare' ? "bg-cyber-purple text-cyber-purple" : "bg-cyber-blue text-cyber-blue"
                )} />
            )}
        </motion.div>
    );
}
