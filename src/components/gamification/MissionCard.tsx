'use client';

import { motion } from 'framer-motion';
import { Check, Gift, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Mission {
    id: string;
    title: string;
    target_count: number;
    current_count: number;
    reward_xp: number;
    is_completed: boolean;
    is_claimed: boolean;
    frequency: 'daily' | 'weekly' | 'one_time';
}

interface MissionCardProps {
    mission: Mission;
    onClaim: (id: string) => void;
}

export function MissionCard({ mission, onClaim }: MissionCardProps) {
    const progress = Math.min((mission.current_count / mission.target_count) * 100, 100);
    const isClaimable = mission.is_completed && !mission.is_claimed;

    return (
        <div className={cn(
            "relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden group",
            mission.is_claimed
                ? "border-cyber-gray/30 bg-cyber-dark/50 opacity-60"
                : isClaimable
                    ? "border-cyber-green bg-cyber-green/10 shadow-[0_0_15px_rgba(102,252,241,0.2)]"
                    : "border-cyber-blue/30 bg-cyber-blue/5"
        )}>
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(69,162,158,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(69,162,158,0.5)_1px,transparent_1px)] bg-[size:20px_20px]" />

            <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "p-1.5 rounded-lg",
                            mission.frequency === 'daily' ? "bg-blue-500/20 text-blue-400" :
                                mission.frequency === 'weekly' ? "bg-purple-500/20 text-purple-400" :
                                    "bg-orange-500/20 text-orange-400"
                        )}>
                            <Target className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm font-orbitron text-white tracking-wide">
                            {mission.title}
                        </h3>
                    </div>

                    {/* Segmented Progress Bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono text-cyber-gray">
                            <span>PROGRESSO</span>
                            <span>{mission.current_count}/{mission.target_count}</span>
                        </div>
                        <div className="h-2 flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => {
                                // Calculate if this segment should be filled
                                const segmentValue = (i + 1) * (100 / 5);
                                const isFilled = progress >= segmentValue;

                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex-1 rounded-sm transition-all duration-500",
                                            isFilled
                                                ? isClaimable ? "bg-cyber-green shadow-[0_0_5px_#66FCF1]" : "bg-cyber-blue shadow-[0_0_5px_#45A29E]"
                                                : "bg-cyber-gray/20"
                                        )}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-cyber-purple font-mono">+{mission.reward_xp} XP</span>

                    {isClaimable ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onClaim(mission.id)}
                            className="px-6 py-2 bg-cyber-green/20 border border-cyber-green text-cyber-green font-bold text-xs rounded-full shadow-[0_0_20px_rgba(102,252,241,0.4)] hover:shadow-[0_0_30px_rgba(102,252,241,0.6)] hover:bg-cyber-green/30 transition-all duration-300 font-orbitron tracking-widest"
                        >
                            RISCATTA
                        </motion.button>
                    ) : mission.is_claimed ? (
                        <div className="px-4 py-2 border border-zinc-600 bg-zinc-800/50 text-zinc-400 font-bold text-xs rounded-lg flex items-center gap-2 font-mono">
                            <Check className="w-3 h-3" /> COMPLETATO
                        </div>
                    ) : (
                        <div className="px-4 py-2 border border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue font-bold text-xs rounded-lg font-mono tracking-wide">
                            ATTIVO
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
