'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Check, Skull, Shield, Play } from 'lucide-react';
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

const NODE_HEIGHT = 120; // Vertical distance between nodes
const AMPLITUDE = 120; // Horizontal sway (pixels)
const FREQUENCY = 0.8; // How tight the curves are

export function SagaMap({ levels }: SagaMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeNodeRef = useRef<HTMLDivElement>(null);

    // Group levels by module
    const modules = useMemo(() => {
        const groups: { title: string; levels: SagaLevel[] }[] = [];
        let currentModuleTitle = '';

        levels.forEach(level => {
            if (level.module_title !== currentModuleTitle) {
                currentModuleTitle = level.module_title || 'Unknown Module';
                groups.push({ title: currentModuleTitle, levels: [] });
            }
            groups[groups.length - 1].levels.push(level);
        });
        return groups;
    }, [levels]);

    // Calculate positions for all levels
    const levelPositions = useMemo(() => {
        return levels.map((level, index) => {
            const y = index * NODE_HEIGHT + 100; // Start with some padding
            const xOffset = Math.sin(index * FREQUENCY) * AMPLITUDE;
            return { xOffset, y };
        });
    }, [levels]);

    // Generate SVG Path
    const svgPath = useMemo(() => {
        if (levelPositions.length === 0) return '';

        let d = `M ${50 + (levelPositions[0].xOffset / 4)} ${levelPositions[0].y}`; // Start at first node (normalized x)

        // To make it responsive, we'll use percentages for X in the actual render, 
        // but for the path 'd' attribute we need concrete numbers if we want a perfect curve.
        // However, since the container width varies, we might need to use a fixed coordinate system 
        // and scale the SVG. Let's assume a fixed coordinate width of 400px for the path calculation.

        const CENTER_X = 200; // Center of our 400px wide coordinate system

        d = `M ${CENTER_X + levelPositions[0].xOffset} ${levelPositions[0].y}`;

        for (let i = 1; i < levelPositions.length; i++) {
            const prev = levelPositions[i - 1];
            const curr = levelPositions[i];
            const prevX = CENTER_X + prev.xOffset;
            const currX = CENTER_X + curr.xOffset;

            // Cubic Bezier Control Points
            const cp1x = prevX;
            const cp1y = prev.y + NODE_HEIGHT / 2;
            const cp2x = currX;
            const cp2y = curr.y - NODE_HEIGHT / 2;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currX} ${curr.y}`;
        }

        return d;
    }, [levelPositions]);

    // Auto-scroll to active level
    useEffect(() => {
        if (activeNodeRef.current) {
            activeNodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [levels]);

    if (levels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4 text-cyber-blue animate-pulse">
                <div className="w-16 h-16 border-4 border-t-transparent border-cyber-blue rounded-full animate-spin" />
                <p className="font-orbitron tracking-widest">SYSTEM BOOTING...</p>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen pb-32 overflow-hidden" ref={containerRef}>
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(69,162,158,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(69,162,158,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* SVG Path Layer */}
            <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                viewBox={`0 0 400 ${levelPositions[levelPositions.length - 1]?.y + 200}`}
                preserveAspectRatio="xMidYMin slice"
            >
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                {/* Glow Path */}
                <path
                    d={svgPath}
                    fill="none"
                    stroke="#45A29E"
                    strokeWidth="4"
                    strokeOpacity="0.3"
                    filter="url(#glow)"
                />
                {/* Core Path */}
                <path
                    d={svgPath}
                    fill="none"
                    stroke="#66FCF1"
                    strokeWidth="2"
                    strokeDasharray="10 5"
                    className="animate-pulse-slow"
                />
            </svg>

            {/* Nodes Layer */}
            <div className="relative z-10 w-full max-w-md mx-auto h-full">
                {levels.map((level, index) => {
                    const pos = levelPositions[index];
                    const isLocked = level.status === 'locked';
                    const isCompleted = level.status === 'completed';
                    const isActive = level.status === 'active';
                    const isBoss = level.is_boss_level;

                    // Check if we need a module header before this node
                    const showModuleHeader = index === 0 || level.module_title !== levels[index - 1].module_title;

                    return (
                        <React.Fragment key={level.id}>
                            {showModuleHeader && (
                                <div
                                    className="absolute w-full flex items-center justify-center"
                                    style={{ top: pos.y - NODE_HEIGHT * 0.6 }}
                                >
                                    <div className="glass-panel px-6 py-2 rounded-full border border-cyber-blue/30 text-cyber-blue font-orbitron text-xs tracking-widest uppercase shadow-[0_0_10px_rgba(69,162,158,0.2)] backdrop-blur-md">
                                        {level.module_title}
                                    </div>
                                </div>
                            )}

                            <div
                                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    top: pos.y,
                                    marginLeft: pos.xOffset
                                }}
                                ref={isActive ? activeNodeRef : null}
                            >
                                <Link
                                    href={isLocked ? '#' : `/quiz/${level.id}`}
                                    className={cn(
                                        "relative group block transition-transform duration-300",
                                        isActive && "scale-110 z-20",
                                        isLocked && "pointer-events-none opacity-60 grayscale"
                                    )}
                                >
                                    {/* Hexagon Node */}
                                    <div className={cn(
                                        "relative flex items-center justify-center transition-all duration-300",
                                        isBoss ? "w-24 h-24" : "w-20 h-20",
                                        "clip-path-hexagon" // We need to ensure this class exists or use inline clip-path
                                    )}
                                        style={{
                                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                                        }}
                                    >
                                        {/* Background & Border */}
                                        <div className={cn(
                                            "absolute inset-0 transition-all duration-300",
                                            isLocked ? "bg-cyber-gray/80" :
                                                isCompleted ? "bg-cyber-green/20 border-2 border-cyber-green" :
                                                    isActive ? "bg-cyber-blue/20 border-2 border-cyber-blue animate-pulse-slow" :
                                                        "bg-cyber-dark border-2 border-cyber-gray"
                                        )} />

                                        {/* Inner Border for Hexagon */}
                                        <div className={cn(
                                            "absolute inset-0.5 bg-cyber-dark clip-path-hexagon z-0",
                                            isCompleted && "bg-cyber-green/10",
                                            isActive && "bg-cyber-blue/10"
                                        )}
                                            style={{
                                                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                                            }}
                                        />

                                        {/* Icon */}
                                        <div className="relative z-10">
                                            {isLocked ? (
                                                <Lock className="w-6 h-6 text-cyber-gray" />
                                            ) : isCompleted ? (
                                                <Check className="w-8 h-8 text-cyber-green drop-shadow-[0_0_5px_#66FCF1]" />
                                            ) : isBoss ? (
                                                <Skull className="w-10 h-10 text-cyber-red animate-pulse" />
                                            ) : isActive ? (
                                                <Play className="w-8 h-8 text-cyber-blue fill-cyber-blue animate-pulse" />
                                            ) : (
                                                <Shield className="w-6 h-6 text-cyber-blue/50" />
                                            )}
                                        </div>

                                        {/* Active Glow Ring */}
                                        {isActive && (
                                            <div className="absolute inset-[-5px] rounded-full bg-cyber-blue/30 blur-md -z-10 animate-pulse" />
                                        )}
                                    </div>

                                    {/* Label (Tooltip style) */}
                                    <div className={cn(
                                        "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 text-center transition-opacity duration-300",
                                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}>
                                        <div className="glass-panel px-2 py-1 rounded text-[10px] font-bold text-white border border-cyber-gray/50">
                                            {level.title}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
