import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, ChevronRight, Lock, Unlock, ShieldCheck } from 'lucide-react';

interface ScannerHUDProps {
    target: {
        name: string;
        status: 'locked' | 'unlocked' | 'safe';
        details?: string;
        type: 'REGION' | 'PROVINCE';
    } | null;
    onAction: () => void;
    actionLabel: string;
    isLocked: boolean; // True if the user has explicitly selected this target
}

const ScannerHUD: React.FC<ScannerHUDProps> = ({ target, onAction, actionLabel, isLocked }) => {

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'locked': return <Lock className="w-4 h-4 text-red-400" />;
            case 'unlocked': return <Unlock className="w-4 h-4 text-emerald-400" />;
            case 'safe': return <ShieldCheck className="w-4 h-4 text-amber-400" />;
            default: return <Scan className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'locked': return 'text-red-400 border-red-500/30 bg-red-950/30';
            case 'unlocked': return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30';
            case 'safe': return 'text-amber-400 border-amber-500/30 bg-amber-950/30';
            default: return 'text-slate-400 border-slate-500/30 bg-slate-950/30';
        }
    };

    return (
        <div className="fixed bottom-28 left-0 right-0 z-40 pointer-events-none flex justify-center px-6">
            <div className="w-full max-w-sm pointer-events-auto">
                <motion.div
                    layout
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-black/60 backdrop-blur-md shadow-lg"
                >
                    {/* Scanner Line Animation */}
                    <motion.div
                        className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/50 shadow-[0_0_10px_#06b6d4]"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="px-4 py-3 flex items-center justify-between gap-4">
                        {/* Info Section */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <Scan className={`w-3 h-3 ${target ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
                                <span className="text-[10px] font-orbitron tracking-widest text-slate-500 uppercase">
                                    {target ? `TARGET: ${target.type}` : 'STANDBY'}
                                </span>
                            </div>

                            <AnimatePresence mode="wait">
                                {target ? (
                                    <motion.div
                                        key="target-info"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                    >
                                        <h3 className="text-lg font-orbitron font-bold text-white truncate tracking-wide text-glow-cyan">
                                            {target.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusColor(target.status)}`}>
                                                {getStatusIcon(target.status)}
                                                <span>{target.status}</span>
                                            </div>
                                            {target.details && (
                                                <span className="text-[10px] text-slate-400 font-mono">{target.details}</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="standby"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-slate-500 text-xs font-mono"
                                    >
                                        SELECT SECTOR
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Action Button */}
                        <AnimatePresence>
                            {target && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8, x: 10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: 10 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onAction}
                                    className="flex items-center justify-center gap-1 px-3 h-10 rounded bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all group"
                                >
                                    <span className="text-[10px] font-bold tracking-wider uppercase">{actionLabel}</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ScannerHUD;
