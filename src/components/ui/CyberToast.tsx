'use client';

import React from 'react';
import { useSystemUI } from '@/context/SystemUIContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export const CyberToast = () => {
    const { toast, hideToast } = useSystemUI();

    if (!toast.visible) return null;

    const variants = {
        success: {
            border: 'border-cyber-green',
            bg: 'bg-cyber-green/10',
            text: 'text-cyber-green',
            icon: CheckCircle,
        },
        error: {
            border: 'border-cyber-red',
            bg: 'bg-cyber-red/10',
            text: 'text-cyber-red',
            icon: AlertTriangle,
        },
        info: {
            border: 'border-cyber-blue',
            bg: 'bg-cyber-blue/10',
            text: 'text-cyber-blue',
            icon: Info,
        },
    };

    const style = variants[toast.type];
    const Icon = style.icon;

    return (
        <AnimatePresence>
            {toast.visible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none"
                >
                    <div className={cn(
                        "pointer-events-auto flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                        style.border,
                        style.bg,
                        "bg-black/80" // Base dark background
                    )}>
                        <div className={cn("p-2 rounded-lg bg-black/40 border border-white/5", style.text)}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className={cn("font-mono text-sm font-bold", style.text)}>
                                {toast.type === 'error' ? 'SYSTEM ERROR' : toast.type === 'success' ? 'SUCCESS' : 'INFO'}
                            </p>
                            <p className="text-sm text-white/90 font-medium leading-tight">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={hideToast}
                            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
