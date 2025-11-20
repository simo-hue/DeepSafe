'use client';

import React from 'react';
import { Check, Lock, Skull, Star, Shield, AlertTriangle, Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface SagaLevel {
    id: string;
    day_number: number;
    title: string;
    is_boss_level: boolean;
    xp_reward: number;
    module_title: string;
    theme_color: string | null;
    order_index: number;
    status: 'locked' | 'active' | 'completed';
}

interface SagaPathProps {
    levels: SagaLevel[];
}

export function SagaPath({ levels }: SagaPathProps) {
    // Group levels by module
    const modules = levels.reduce((acc, level) => {
        const modTitle = level.module_title || 'Unknown Module';
        if (!acc[modTitle]) acc[modTitle] = [];
        acc[modTitle].push(level);
        return acc;
    }, {} as Record<string, SagaLevel[]>);

    return (
        <div className="relative space-y-12 py-8">
            {/* Circuit Line Background */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-cyber-gray/30 z-0">
                <motion.div
                    className="absolute top-0 left-0 w-full bg-gradient-to-b from-cyber-blue via-cyber-purple to-cyber-blue"
                    initial={{ height: '0%' }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            </div>

            {Object.entries(modules).map(([moduleTitle, moduleLevels], modIndex) => (
                <div key={moduleTitle} className="relative z-10">
                    <div className="sticky top-4 z-20 mb-6 ml-12">
                        <h3 className="text-sm font-orbitron tracking-widest text-cyber-blue uppercase drop-shadow-[0_0_5px_rgba(69,162,158,0.5)]">
                            {moduleTitle}
                        </h3>
                    </div>

                    <div className="space-y-8">
                        {moduleLevels.map((level, index) => {
                            const isLocked = level.status === 'locked';
                            const isCompleted = level.status === 'completed';
                            const isActive = level.status === 'active';
                            const isBoss = level.is_boss_level;

                            return (
                                <Link
                                    key={level.id}
                                    href={isLocked ? '#' : `/quiz/${level.id}`}
                                    className={cn(
                                        "flex items-center gap-6 group relative",
                                        isLocked && "pointer-events-none opacity-50"
                                    )}
                                >
                                    {/* Node Connector Line (Horizontal) */}
                                    <div className={cn(
                                        "absolute left-8 w-8 h-0.5 bg-cyber-gray/50",
                                        (isCompleted || isActive) && "bg-cyber-blue shadow-[0_0_8px_#45A29E]"
                                    )} />

                                    {/* Hexagon Node */}
                                    <div className="relative flex-shrink-0 ml-4">
                                        <div className={cn(
                                            "w-16 h-16 flex items-center justify-center transition-all duration-500",
                                            isActive && "scale-110"
                                        )}>
                                            {/* Hexagon Shape SVG */}
                                            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 drop-shadow-lg">
                                                <path
                                                    d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
                                                    className={cn(
                                                        "fill-cyber-dark stroke-2 transition-all duration-300",
                                                        isLocked ? "stroke-cyber-gray" :
                                                            isBoss ? "stroke-cyber-red fill-cyber-red/10" :
                                                                isActive ? "stroke-cyber-blue fill-cyber-blue/20" : "stroke-cyber-green fill-cyber-green/10"
                                                    )}
                                                />
                                            </svg>

                                            {/* Icon */}
                                            <div className="relative z-10">
                                                {isLocked ? (
                                                    <Lock className="w-6 h-6 text-cyber-gray" />
                                                ) : isCompleted ? (
                                                    <Check className="w-8 h-8 text-cyber-green drop-shadow-[0_0_5px_#66FCF1]" />
                                                ) : isBoss ? (
                                                    <Skull className="w-8 h-8 text-cyber-red animate-pulse-slow" />
                                                ) : (
                                                    <div className="w-4 h-4 bg-cyber-blue rounded-full animate-ping" />
                                                )}
                                            </div>

                                            {/* Active Ring Animation */}
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-0"
                                                    initial={{ opacity: 0, scale: 1 }}
                                                    animate={{ opacity: [0, 0.5, 0], scale: [1, 1.2, 1.4] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                                        <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" className="fill-none stroke-cyber-blue stroke-1" />
                                                    </svg>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Level Info Card */}
                                    <div className={cn(
                                        "flex-1 p-4 rounded-r-xl border-l-4 transition-all duration-300",
                                        "glass-card",
                                        isLocked ? "border-cyber-gray text-cyber-gray" :
                                            isActive ? "border-cyber-blue bg-cyber-blue/5 translate-x-2" :
                                                isCompleted ? "border-cyber-green" : "border-cyber-gray",
                                        isBoss && !isLocked && "border-cyber-red bg-cyber-red/5"
                                    )}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={cn(
                                                    "font-bold text-sm mb-1 font-orbitron tracking-wide",
                                                    isActive && "text-cyber-blue text-glow",
                                                    isBoss && !isLocked && "text-cyber-red text-glow-danger"
                                                )}>
                                                    {isBoss ? 'BOSS LEVEL' : `Day ${level.day_number}`}
                                                </h4>
                                                <p className="text-xs text-gray-400 line-clamp-1">{level.title}</p>
                                            </div>
                                            {level.xp_reward > 0 && (
                                                <span className="text-xs font-mono text-cyber-purple font-bold">
                                                    +{level.xp_reward} XP
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
