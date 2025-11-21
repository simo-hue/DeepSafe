'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Skull, Shield, Play, X, AlertCircle, Bot, Smartphone, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

interface SagaMapProps {
    levels: SagaLevel[];
}

export function SagaMap({ levels }: SagaMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeNodeRef = useRef<HTMLDivElement>(null);
    const [showLockedModal, setShowLockedModal] = useState(false);
    const [lockedLevel, setLockedLevel] = useState<SagaLevel | null>(null);

    // Auto-scroll to active level
    useEffect(() => {
        if (activeNodeRef.current) {
            activeNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [levels]);

    const handleLockedClick = (level: SagaLevel) => {
        setLockedLevel(level);
        setShowLockedModal(true);
    };

    if (levels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4 text-cyber-blue animate-pulse">
                <div className="w-16 h-16 border-4 border-t-transparent border-cyber-blue rounded-full animate-spin" />
                <p className="font-orbitron tracking-widest">SYSTEM BOOTING...</p>
            </div>
        );
    }

    return (
        <>
            <div className="relative w-full pb-32" ref={containerRef}>
                {/* Module Groups */}
                {levels.reduce((acc, level, index) => {
                    const isNewModule = index === 0 || level.module_title !== levels[index - 1].module_title;
                    if (isNewModule) {
                        acc.push([level]);
                    } else {
                        acc[acc.length - 1].push(level);
                    }
                    return acc;
                }, [] as SagaLevel[][]).map((moduleLevels, moduleIdx) => (
                    <div key={moduleIdx} className="mb-12">
                        {/* Module Header */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="glass-panel px-6 py-2 rounded-full border border-cyber-blue/30 text-cyber-blue font-orbitron text-xs tracking-widest uppercase shadow-[0_0_10px_rgba(69,162,158,0.2)]">
                                {moduleLevels[0].module_title}
                            </div>
                        </div>

                        {/* Levels */}
                        <div className="space-y-6">
                            {moduleLevels.map((level, levelIdx) => {
                                const isLocked = level.status === 'locked';
                                const isCompleted = level.status === 'completed';
                                const isActive = level.status === 'active';
                                const isBoss = level.is_boss_level;

                                // Find if this is the "Next Up" level (first locked level)
                                const isNextUp = isLocked && levels.find(l => l.status === 'locked')?.id === level.id;

                                const LevelWrapper = isLocked ? 'div' : Link;
                                const wrapperProps = isLocked
                                    ? { onClick: () => handleLockedClick(level) }
                                    : { href: `/quiz/${level.id}` };

                                // Determine Icon
                                let LevelIcon = Shield;
                                if (level.module_title.includes('AI')) LevelIcon = Bot;
                                if (level.module_title.includes('Scam')) LevelIcon = Smartphone;
                                if (level.module_title.includes('Deepfake')) LevelIcon = Eye;
                                if (isBoss) LevelIcon = Skull;

                                return (
                                    <div
                                        key={level.id}
                                        ref={isActive ? activeNodeRef : null}
                                        className="relative"
                                    >
                                        <LevelWrapper
                                            {...wrapperProps as any}
                                            className={cn(
                                                "flex items-center gap-4 group cursor-pointer transition-all duration-300",
                                                isLocked && !isNextUp && "opacity-80 hover:opacity-100",
                                                isNextUp && "scale-[1.02]"
                                            )}
                                        >
                                            {/* Connection Line */}
                                            {levelIdx > 0 && (
                                                <div className={cn(
                                                    "absolute left-8 -top-6 w-0.5 h-6",
                                                    isLocked ? "bg-cyber-gray/30" : "bg-gradient-to-b from-cyber-blue to-transparent"
                                                )} />
                                            )}

                                            {/* Hexagon Node */}
                                            <div className="relative flex-shrink-0">
                                                <div
                                                    className={cn(
                                                        "relative flex items-center justify-center transition-all duration-300",
                                                        isBoss ? "w-20 h-20" : "w-16 h-16",
                                                        isActive && "scale-110"
                                                    )}
                                                    style={{
                                                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                                                    }}
                                                >
                                                    {/* Background */}
                                                    <div
                                                        className={cn(
                                                            "absolute inset-0 transition-all duration-300",
                                                            isLocked ? "bg-cyber-gray/20" :
                                                                isCompleted ? "bg-cyber-green/20" :
                                                                    isActive ? "bg-cyber-blue/20" :
                                                                        "bg-cyber-dark"
                                                        )}
                                                        style={{
                                                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                                                        }}
                                                    />

                                                    {/* Border */}
                                                    <svg
                                                        viewBox="0 0 100 100"
                                                        className="absolute inset-0 w-full h-full"
                                                    >
                                                        <path
                                                            d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
                                                            className={cn(
                                                                "fill-none stroke-2 transition-all duration-300",
                                                                isLocked && isBoss ? "stroke-cyber-red stroke-dashed" :
                                                                    isLocked ? "stroke-cyber-gray/50" :
                                                                        isBoss ? "stroke-cyber-red" :
                                                                            isActive ? "stroke-cyber-blue" :
                                                                                isCompleted ? "stroke-cyber-green" :
                                                                                    "stroke-cyber-gray"
                                                            )}
                                                            strokeDasharray={isLocked && isBoss ? "4 2" : "none"}
                                                        />
                                                    </svg>

                                                    {/* Icon */}
                                                    <div className={cn(
                                                        "relative z-10 transition-all duration-300",
                                                        isLocked && "grayscale opacity-50 group-hover:opacity-80",
                                                        isLocked && isBoss && "opacity-100 grayscale-0 text-black drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                                                    )}>
                                                        {isLocked ? (
                                                            <div className="relative">
                                                                {/* Teaser Icon */}
                                                                <LevelIcon className={cn(
                                                                    isBoss ? "w-10 h-10 text-cyber-red" : "w-6 h-6 text-cyber-blue",
                                                                    isBoss && "fill-current"
                                                                )} />
                                                                {/* Lock Overlay */}
                                                                <div className="absolute -bottom-2 -right-2 bg-cyber-dark rounded-full p-1 border border-cyber-gray">
                                                                    <Lock className="w-3 h-3 text-cyber-gray" />
                                                                </div>
                                                            </div>
                                                        ) : isCompleted ? (
                                                            <Check className="w-6 h-6 text-cyber-green drop-shadow-[0_0_5px_#66FCF1]" />
                                                        ) : isBoss ? (
                                                            <Skull className="w-8 h-8 text-cyber-red animate-pulse" />
                                                        ) : isActive ? (
                                                            <Play className="w-6 h-6 text-cyber-blue fill-cyber-blue animate-pulse" />
                                                        ) : (
                                                            <Shield className="w-5 h-5 text-cyber-blue/50" />
                                                        )}
                                                    </div>

                                                    {/* Active Glow */}
                                                    {isActive && (
                                                        <motion.div
                                                            className="absolute inset-0"
                                                            initial={{ opacity: 0, scale: 1 }}
                                                            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.3, 1.5] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        >
                                                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                                                <path
                                                                    d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
                                                                    className="fill-none stroke-cyber-blue stroke-1"
                                                                />
                                                            </svg>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Level Info Card */}
                                            <div
                                                className={cn(
                                                    "flex-1 p-4 rounded-xl border-l-4 transition-all duration-300 glass-card relative overflow-hidden",
                                                    isLocked ? "border-cyber-gray/30 bg-black/20" :
                                                        isActive ? "border-cyber-blue bg-cyber-blue/5" :
                                                            isCompleted ? "border-cyber-green" :
                                                                "border-cyber-gray",
                                                    isBoss && "fire-border bg-cyber-red/5",
                                                    isBoss && isLocked && "border-cyber-red/30 border-dashed"
                                                )}
                                            >
                                                {/* Next Up Badge */}
                                                {isNextUp && (
                                                    <div className="absolute top-0 right-0 bg-cyber-blue text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg font-orbitron">
                                                        NEXT UNLOCK
                                                    </div>
                                                )}

                                                {/* Boss Threat Badge */}
                                                {isBoss && isLocked && (
                                                    <div className="absolute top-0 right-0 bg-cyber-red/20 text-cyber-red text-[10px] font-bold px-2 py-0.5 rounded-bl-lg font-orbitron animate-pulse border-l border-b border-cyber-red/50">
                                                        ⚠ THREAT DETECTED
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start relative z-10">
                                                    <div className="flex-1 min-w-0">
                                                        <h4
                                                            className={cn(
                                                                "font-bold text-sm mb-1 font-orbitron tracking-wide",
                                                                isActive && "text-cyber-blue text-glow",
                                                                isBoss && !isLocked && "text-cyber-red text-glow-danger",
                                                                isLocked && "text-zinc-500"
                                                            )}
                                                        >
                                                            {isBoss ? 'BOSS LEVEL' : `Day ${level.day_number}`}
                                                        </h4>
                                                        <p className={cn(
                                                            "text-xs line-clamp-1",
                                                            isLocked ? "text-zinc-600 blur-[2px] select-none" : "text-gray-400"
                                                        )}>
                                                            {level.title}
                                                        </p>
                                                    </div>
                                                    {level.xp_reward > 0 && !isLocked && (
                                                        <span className="text-xs font-mono text-cyber-purple font-bold ml-2">
                                                            +{level.xp_reward} XP
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Locked Overlay Pattern */}
                                                {isLocked && (
                                                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
                                                )}
                                            </div>
                                        </LevelWrapper>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Locked Level Modal */}
            <AnimatePresence>
                {showLockedModal && lockedLevel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowLockedModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-cyber-red/20 blur-2xl rounded-2xl" />

                            <div className="relative glass-panel border-2 border-cyber-red/50 rounded-2xl p-6 space-y-4">
                                {/* Close button */}
                                <button
                                    onClick={() => setShowLockedModal(false)}
                                    className="absolute top-4 right-4 text-cyber-gray hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-cyber-red/20 flex items-center justify-center border-2 border-cyber-red animate-pulse">
                                        <Lock className="w-8 h-8 text-cyber-red" />
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold font-orbitron text-cyber-red text-glow-danger">
                                        ACCESS DENIED
                                    </h3>
                                    <p className="text-sm text-cyan-400 font-mono">
                                        {lockedLevel.is_boss_level ? 'BOSS LEVEL' : `Day ${lockedLevel.day_number}`}
                                    </p>
                                </div>

                                {/* Message */}
                                <div className="bg-cyber-dark/50 rounded-xl p-4 border border-cyber-red/30">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-cyber-red flex-shrink-0 mt-0.5" />
                                        <div className="space-y-2">
                                            <p className="text-sm text-zinc-300">
                                                <span className="text-white font-bold">"{lockedLevel.title}"</span> is currently locked.
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                Complete the previous {lockedLevel.is_boss_level ? 'levels' : 'day'} in your journey to unlock this challenge.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => setShowLockedModal(false)}
                                    className="w-full py-3 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue font-bold rounded-xl hover:bg-cyber-blue hover:text-cyber-dark transition-all font-orbitron tracking-wide"
                                >
                                    UNDERSTOOD
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
