import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Lock, Star, AlertTriangle, Shield, Skull } from 'lucide-react';
import Link from 'next/link';

export interface SagaLevel {
    id: string;
    day_number: number;
    title: string;
    is_boss_level: boolean;
    xp_reward: number;
    module_title: string;
    theme_color: string;
    order_index: number;
    status: 'locked' | 'active' | 'completed';
}

interface SagaPathProps {
    levels: SagaLevel[];
}

export function SagaPath({ levels }: SagaPathProps) {
    return (
        <div className="relative flex flex-col items-center py-8 space-y-8">
            {/* Central Line */}
            <div className="absolute top-0 bottom-0 w-1 bg-zinc-200 dark:bg-zinc-800 -z-10" />

            {levels.map((level, index) => {
                const isLeft = index % 2 === 0;

                // Determine Icon and Color based on type
                let Icon = Check;
                let colorClass = "bg-blue-500";
                let sizeClass = "w-12 h-12";
                let borderClass = "border-blue-200 dark:border-blue-900";
                let animationClass = "";

                if (level.is_boss_level) {
                    Icon = Skull;
                    colorClass = "bg-red-600";
                    sizeClass = "w-16 h-16";
                    borderClass = "border-red-200 dark:border-red-900";
                    if (level.status === 'active') animationClass = "animate-pulse";
                } else if (level.status === 'locked') {
                    Icon = Lock;
                    colorClass = "bg-zinc-400";
                    borderClass = "border-zinc-200 dark:border-zinc-800";
                } else if (level.status === 'completed') {
                    colorClass = "bg-green-500";
                    borderClass = "border-green-200 dark:border-green-900";
                } else if (level.status === 'active') {
                    colorClass = "bg-blue-600";
                    borderClass = "border-blue-300 dark:border-blue-800";
                    animationClass = "ring-4 ring-blue-200 dark:ring-blue-900";
                }

                return (
                    <div key={level.id} className={cn(
                        "relative w-full max-w-md flex items-center",
                        isLeft ? "justify-start" : "justify-end"
                    )}>
                        {/* Connecting Line (Horizontal) */}
                        <div className={cn(
                            "absolute top-1/2 w-1/2 h-1 bg-zinc-200 dark:bg-zinc-800 -z-10",
                            isLeft ? "right-1/2" : "left-1/2"
                        )} />

                        <Link
                            href={level.status === 'locked' ? '#' : `/quiz/${level.id}`}
                            className={cn(
                                "relative group flex flex-col items-center transition-transform hover:scale-105",
                                level.status === 'locked' && "opacity-70 cursor-not-allowed hover:scale-100"
                            )}
                        >
                            {/* Node Circle */}
                            <div className={cn(
                                "rounded-full flex items-center justify-center text-white shadow-lg border-4 z-10 transition-all",
                                colorClass,
                                sizeClass,
                                borderClass,
                                animationClass
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>

                            {/* Label Card */}
                            <div className={cn(
                                "absolute top-full mt-2 p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-100 dark:border-zinc-800 w-48 text-center z-20",
                                isLeft ? "left-0 text-left" : "right-0 text-right"
                            )}>
                                <div className="text-xs uppercase tracking-wider font-bold text-zinc-400 mb-1">Day {level.day_number}</div>
                                <h3 className="font-bold text-sm leading-tight">{level.title}</h3>
                                {level.is_boss_level && (
                                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider block mt-1">Boss Level</span>
                                )}
                                <div className="text-xs text-zinc-500 mt-1">
                                    {level.xp_reward} XP
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
