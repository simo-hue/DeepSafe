import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Zap, Coins, Clock, X, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MatrixRain } from '@/components/ui/MatrixRain';

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
    const [decryptionText, setDecryptionText] = useState('');

    useEffect(() => {
        if (isOpen && isOpening) {
            setStep('decrypting');
            // Matrix-like text effect
            const interval = setInterval(() => {
                setDecryptionText(Math.random().toString(36).substring(2, 15).toUpperCase());
            }, 50);
            return () => clearInterval(interval);
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
                className="bg-slate-900 border border-purple-500/30 rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)]"
            >
                {/* Matrix Rain Background */}
                <MatrixRain color="#a855f7" className="opacity-20" />

                {/* Close Button */}
                {!isOpening && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20"
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
                            className="space-y-6 relative z-10"
                        >
                            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                                {/* Spinning Rings */}
                                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-[spin_3s_linear_infinite]" />
                                <div className="absolute inset-2 border-4 border-cyan-500/30 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                                <div className="absolute inset-4 border-2 border-purple-400/50 rounded-full animate-pulse border-dashed" />

                                {/* Glitching Lock Icon */}
                                <motion.div
                                    animate={{
                                        x: [0, -2, 2, -1, 1, 0],
                                        opacity: [1, 0.8, 1, 0.9, 1]
                                    }}
                                    transition={{ repeat: Infinity, duration: 0.2 }}
                                >
                                    <Lock className="w-16 h-16 text-purple-400" />
                                </motion.div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-purple-400 font-orbitron animate-pulse">
                                    DECRITTAZIONE...
                                </h3>
                                <p className="font-mono text-xs text-cyan-500 mt-2 h-4 overflow-hidden">
                                    {decryptionText}
                                </p>
                                <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, ease: "easeInOut" }}
                                    />
                                    <motion.div
                                        className="absolute top-0 bottom-0 w-20 bg-white/50 blur-md"
                                        animate={{ x: [-100, 400] }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'revealed' && reward && (
                        <motion.div
                            key="revealed"
                            initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                            className="space-y-6 relative z-10"
                        >
                            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-cyan-500 blur-2xl opacity-60 rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {reward.type === 'xp' && <Zap className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,1)]" />}
                                    {reward.type === 'credits' && <Coins className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,1)]" />}
                                    {reward.type === 'streak_freeze' && <Clock className="w-24 h-24 text-orange-400 drop-shadow-[0_0_25px_rgba(251,146,60,1)]" />}
                                    {reward.type === 'lives' && <Gift className="w-24 h-24 text-red-400 drop-shadow-[0_0_25px_rgba(248,113,113,1)]" />}
                                </motion.div>

                                {/* Particle Burst Effect (Simulated with divs) */}
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 bg-white rounded-full"
                                        initial={{ x: 0, y: 0, opacity: 1 }}
                                        animate={{
                                            x: (Math.random() - 0.5) * 300,
                                            y: (Math.random() - 0.5) * 300,
                                            opacity: 0,
                                            scale: 0
                                        }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                ))}
                            </div>

                            <div className="space-y-2">
                                <motion.h3
                                    className="text-2xl font-bold text-white font-orbitron"
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {reward.type === 'xp' && 'DATI EXTRA RECUPERATI!'}
                                    {reward.type === 'credits' && 'CREDITI RIMBORSATI!'}
                                    {reward.type === 'streak_freeze' && 'CONGELAMENTO SERIE!'}
                                    {reward.type === 'lives' && 'RIPRISTINO SISTEMA!'}
                                </motion.h3>
                                <motion.p
                                    className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-300% animate-gradient"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                >
                                    +{reward.value} {reward.type === 'xp' ? 'XP' : reward.type === 'credits' ? 'NC' : ''}
                                </motion.p>
                            </div>

                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors font-orbitron tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                RISCATTA
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
