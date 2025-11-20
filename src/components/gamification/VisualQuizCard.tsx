import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Hotspot } from '@/lib/mockData';
import { Check, X, Info } from 'lucide-react';

interface VisualQuizCardProps {
    imageUrl: string;
    correctAnswer: number; // 0 = Real, 1 = AI
    hotspots?: Hotspot[];
    onAnswer: (index: number) => void;
    disabled?: boolean;
}

export function VisualQuizCard({ imageUrl, correctAnswer, hotspots, onAnswer, disabled }: VisualQuizCardProps) {
    const [selected, setSelected] = useState<number | null>(null);
    const [showHotspots, setShowHotspots] = useState(false);

    const handleSelect = (index: number) => {
        if (disabled || selected !== null) return;
        setSelected(index);
        setShowHotspots(true);
        onAnswer(index);
    };

    const isCorrect = selected === correctAnswer;

    return (
        <div className="space-y-6">
            {/* Image Container */}
            <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg border-2 border-zinc-200 dark:border-zinc-700">
                {/* The Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageUrl}
                    alt="Quiz Challenge"
                    className="w-full h-full object-cover"
                />

                {/* Hotspots Overlay (Only shown after answering) */}
                {showHotspots && hotspots && hotspots.map((hotspot, i) => (
                    <div
                        key={i}
                        className="absolute w-12 h-12 rounded-full border-4 border-yellow-400 animate-pulse flex items-center justify-center z-10"
                        style={{
                            left: `${hotspot.x}%`,
                            top: `${hotspot.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded absolute -bottom-8 whitespace-nowrap shadow-md">
                            {hotspot.label}
                        </div>
                    </div>
                ))}

                {/* Result Overlay */}
                {selected !== null && (
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all",
                        isCorrect ? "bg-green-900/20" : "bg-red-900/20"
                    )}>
                        <div className={cn(
                            "px-6 py-3 rounded-full font-bold text-white text-xl shadow-xl flex items-center gap-2 animate-in zoom-in",
                            isCorrect ? "bg-green-500" : "bg-red-500"
                        )}>
                            {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                            {isCorrect ? "Correct!" : "Incorrect"}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleSelect(0)}
                    disabled={disabled || selected !== null}
                    className={cn(
                        "p-6 rounded-2xl font-bold text-xl transition-all transform active:scale-95 flex flex-col items-center gap-2 shadow-sm border-b-4",
                        selected === 0
                            ? (correctAnswer === 0 ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700")
                            : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    )}
                >
                    <span className="text-3xl">📷</span>
                    Real
                </button>

                <button
                    onClick={() => handleSelect(1)}
                    disabled={disabled || selected !== null}
                    className={cn(
                        "p-6 rounded-2xl font-bold text-xl transition-all transform active:scale-95 flex flex-col items-center gap-2 shadow-sm border-b-4",
                        selected === 1
                            ? (correctAnswer === 1 ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700")
                            : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    )}
                >
                    <span className="text-3xl">🤖</span>
                    AI Fake
                </button>
            </div>

            {/* Hint Text */}
            {!selected && (
                <p className="text-center text-zinc-500 text-sm flex items-center justify-center gap-1">
                    <Info className="w-4 h-4" />
                    Tap the button that matches the image source
                </p>
            )}
        </div>
    );
}
