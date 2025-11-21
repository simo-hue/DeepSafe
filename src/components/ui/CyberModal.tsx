'use client';

import React from 'react';
import { useSystemUI } from '@/context/SystemUIContext';
import { ShieldAlert, Lock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export const CyberModal = () => {
    const { modal, closeModal } = useSystemUI();

    if (!modal.visible) return null;

    return (
        <AnimatePresence>
            {modal.visible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-cyber-dark border border-neon-blue/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        {/* Decorative Header Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50" />

                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue animate-pulse">
                                        <ShieldAlert className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-bold font-orbitron text-white tracking-wide">
                                        {modal.title}
                                    </h2>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="mb-8">
                                <p className="text-zinc-300 text-lg leading-relaxed border-l-2 border-neon-blue/20 pl-4">
                                    {modal.message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {modal.actionLabel && modal.onAction && (
                                    <button
                                        onClick={() => {
                                            modal.onAction?.();
                                            closeModal();
                                        }}
                                        className="flex-1 py-3 rounded-lg bg-neon-blue text-black font-bold font-mono hover:bg-neon-blue/90 transition-all shadow-[0_0_15px_rgba(102,252,241,0.3)] flex items-center justify-center gap-2"
                                    >
                                        <Lock className="w-4 h-4" />
                                        {modal.actionLabel}
                                    </button>
                                )}
                                <button
                                    onClick={closeModal}
                                    className="flex-1 py-3 rounded-lg border border-white/10 bg-white/5 text-white font-bold font-mono hover:bg-white/10 transition-all"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>

                        {/* Decorative Corner Accents */}
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neon-blue/30 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-neon-blue/30 rounded-br-lg" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
