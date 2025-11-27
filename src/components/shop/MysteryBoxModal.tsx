import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Zap, Coins, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MysteryBoxModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: {
        type: string;
        value: number;
    } | null;
    isOpening: boolean;
}

export function MysteryBoxModal({ isOpen, onClose, reward, isOpening }: MysteryBoxModalProps) {
    const [step, setStep] = useState<'idle' | 'decrypting' | 'revealed'>('idle');

    useEffect(() => {
        if (isOpen && isOpening) {
            setStep('decrypting');
        } else if (isOpen && reward) {
            setStep('revealed');
        } else if (!isOpen) {
            setStep('idle');
        }
    }, [isOpen, isOpening, reward]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-slate-900 border border-purple-500/30 rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
            >
                {/* Close Button */}
                {!isOpening && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}

                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

                <AnimatePresence mode="wait">
                    {step === 'decrypting' && (
                        <motion.div
                            key="decrypting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="relative w-32 h-32 mx-auto">
                                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-spin-slow" />
                                <div className="absolute inset-2 border-4 border-purple-400/50 rounded-full animate-spin-reverse-slower border-dashed" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Gift className="w-12 h-12 text-purple-400 animate-bounce" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-purple-400 font-orbitron animate-pulse">DECRITTAZIONE IN CORSO...</h3>
                                <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-purple-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5, ease: "linear" }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'revealed' && reward && (
                        <motion.div
                            key="revealed"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="space-y-6"
                        >
                            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-cyan-500 blur-xl opacity-50 rounded-full animate-pulse" />
                                {reward.type === 'xp' && <Zap className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />}
                                {reward.type === 'credits' && <Coins className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />}
                                {reward.type === 'streak_freeze' && <Clock className="w-20 h-20 text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]" />}
                                {reward.type === 'lives' && <Gift className="w-20 h-20 text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]" />}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white font-orbitron">
                                    {reward.type === 'xp' && 'DATI EXTRA RECUPERATI!'}
                                    {reward.type === 'credits' && 'CREDITI RIMBORSATI!'}
                                    {reward.type === 'streak_freeze' && 'CONGELAMENTO SERIE!'}
                                    {reward.type === 'lives' && 'RIPRISTINO SISTEMA!'}
                                </h3>
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                                    +{reward.value} {reward.type === 'xp' ? 'XP' : reward.type === 'credits' ? 'NC' : ''}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors font-orbitron tracking-wider"
                            >
                                RISCATTA
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
