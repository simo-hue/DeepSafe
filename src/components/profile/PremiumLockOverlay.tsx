import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumLockOverlayProps {
    onUnlock: () => void;
}

export const PremiumLockOverlay: React.FC<PremiumLockOverlayProps> = ({ onUnlock }) => {
    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-[6px] rounded-2xl border border-slate-800/50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center p-6"
            >
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
                    <div className="relative w-16 h-16 bg-slate-900 border border-amber-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <Lock className="w-8 h-8 text-amber-500" />
                        <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-slate-900">
                            <Crown className="w-3 h-3 text-slate-900 fill-slate-900" />
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold font-orbitron text-white mb-2 tracking-wide">
                    STATISTICHE CLASSIFICATE
                </h3>
                <p className="text-slate-400 text-sm max-w-[280px] mb-6 leading-relaxed">
                    L'accesso ai dati avanzati sulle prestazioni è limitato agli agenti con autorizzazione <span className="text-amber-400 font-bold">PREMIUM</span>.
                </p>

                <button
                    onClick={onUnlock}
                    className="group relative px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold font-orbitron rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        SBLOCCA ORA
                    </span>
                </button>
            </motion.div>
        </div>
    );
};
