'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Skull, Shield, Play, X, AlertCircle } from 'lucide-react';
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

                                const LevelWrapper = isLocked ? 'div' : Link;
                                const wrapperProps = isLocked
                                    ? { onClick: () => handleLockedClick(level) }
                                    : { href: `/quiz/${level.id}` };

                                return (
                                    <div
                                        key={level.id}
                                        ref={isActive ? activeNodeRef : null}
                                        className="relative"
                                    >
                                        <LevelWrapper
                                            {...wrapperProps as any}
                                            className={cn(
                                                "flex items-center gap-4 group cursor-pointer",
                                                isLocked && "opacity-60"
                                            )}
                                        >
                                            {/* Connection Line */}
                                            {levelIdx > 0 && (
                                                <div className="absolute left-8 -top-6 w-0.5 h-6 bg-gradient-to-b from-cyber-blue to-transparent" />
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
                                                            isLocked ? "bg-cyber-gray/50" :
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
                                                                isLocked ? "stroke-cyber-gray" :
                                                                    isBoss ? "stroke-cyber-red" :
                                                                        isActive ? "stroke-cyber-blue" :
                                                                            isCompleted ? "stroke-cyber-green" :
                                                                                "stroke-cyber-gray"
                                                            )}
                                                        />
                                                    </svg>

                                                    {/* Icon */}
                                                    <div className="relative z-10">
                                                        {isLocked ? (
                                                            <Lock className="w-5 h-5 text-cyber-gray" />
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
                                                    "flex-1 p-4 rounded-xl border-l-4 transition-all duration-300 glass-card",
                                                    isLocked ? "border-cyber-gray text-cyber-gray" :
                                                        isActive ? "border-cyber-blue bg-cyber-blue/5" :
                                                            isCompleted ? "border-cyber-green" :
                                                                "border-cyber-gray",
                                                    isBoss && "fire-border bg-cyber-red/5"
                                                )}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4
                                                            className={cn(
                                                                "font-bold text-sm mb-1 font-orbitron tracking-wide",
                                                                isActive && "text-cyber-blue text-glow",
                                                                isBoss && !isLocked && "text-cyber-red text-glow-danger"
                                                            )}
                                                        >
                                                            {isBoss ? 'BOSS LEVEL' : `Day ${level.day_number}`}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 line-clamp-1">
                                                            {level.title}
                                                        </p>
                                                    </div>
                                                    {level.xp_reward > 0 && (
                                                        <span className="text-xs font-mono text-cyber-purple font-bold">
                                                            +{level.xp_reward} XP
                                                        </span>
                                                    )}
                                                </div>
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
