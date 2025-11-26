'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BadgeDefinition } from '@/data/badgesData';
import { X, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface BadgeUnlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    badgeId: string | null;
}

export function BadgeUnlockModal({ isOpen, onClose, badgeId }: BadgeUnlockModalProps) {
    const [badge, setBadge] = useState<BadgeDefinition | null>(null);

    useEffect(() => {
        if (isOpen && badgeId) {
            // Load badge data dynamically to avoid circular deps if any, 
            // or just import it if it's safe. 
            // For now, we assume we can import it.
            import('@/data/badgesData').then(({ BADGES_DATA }) => {
                const found = BADGES_DATA.find(b => b.id === badgeId);
                if (found) {
                    setBadge(found);
                    triggerConfetti();
                }
            });
        }
    }, [isOpen, badgeId]);

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    if (!isOpen || !badge) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.5, y: 50, rotateX: 45 }}
                        animate={{ scale: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.5, y: 50, opacity: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="bg-cyber-dark border-2 border-cyan-500/50 rounded-2xl p-1 max-w-sm w-full relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scan" />

                        <div className="flex flex-col items-center text-center p-8 space-y-6 relative z-10">

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="text-cyan-400 font-bold font-orbitron tracking-widest uppercase text-sm flex items-center gap-2"
                            >
                                <Trophy className="w-4 h-4" />
                                Nuovo Badge Sbloccato!
                            </motion.div>

                            {/* 3D Floating Badge */}
                            <div className="w-40 h-40 relative animate-float">
                                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
                                <div className="text-8xl relative z-10 drop-shadow-[0_0_30px_rgba(6,182,212,0.8)] filter contrast-125">
                                    {badge.icon}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold font-orbitron text-white text-glow">
                                    {badge.name}
                                </h3>
                                <div className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-cyan-500 text-cyan-400 bg-cyan-950/30">
                                    +{badge.xpReward} XP
                                </div>
                            </div>

                            <p className="text-zinc-300 italic font-mono text-sm">
                                "{badge.description}"
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-all font-orbitron tracking-widest shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                            >
                                RISCATTA
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
