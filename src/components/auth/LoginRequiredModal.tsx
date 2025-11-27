"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full text-center relative shadow-[0_0_50px_rgba(6,182,212,0.2)]"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                    <Lock className="w-10 h-10 text-cyan-400" />
                </div>

                <h2 className="text-2xl font-bold text-white font-orbitron mb-2">ACCESSO RICHIESTO</h2>
                <p className="text-slate-400 mb-8">
                    Devi eseguire l'accesso per interagire con la mappa e accedere alle missioni.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-lg border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors font-orbitron"
                    >
                        ANNULLA
                    </button>
                    <button
                        onClick={() => router.push('/login')}
                        className="flex-1 py-3 px-4 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors font-orbitron flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(8,145,178,0.4)]"
                    >
                        <LogIn className="w-4 h-4" />
                        ACCEDI
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
