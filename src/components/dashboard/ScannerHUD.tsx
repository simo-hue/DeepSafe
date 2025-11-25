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
        <div className="absolute bottom-24 left-0 w-full px-4 z-30 pointer-events-none flex justify-center">
            <div className="w-full max-w-md pointer-events-auto">
                <motion.div
                    layout
                    className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                    {/* Scanner Line Animation */}
                    <motion.div
                        className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/50 shadow-[0_0_10px_#06b6d4]"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="p-4 flex items-center justify-between gap-4">
                        {/* Info Section */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Scan className={`w-3 h-3 ${target ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
                                <span className="text-[10px] font-orbitron tracking-widest text-slate-500 uppercase">
                                    {target ? `TARGET ACQUIRED: ${target.type}` : 'SYSTEM STANDBY'}
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
                                        <h3 className="text-xl font-orbitron font-bold text-white truncate tracking-wide text-glow-cyan">
                                            {target.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(target.status)}`}>
                                                {getStatusIcon(target.status)}
                                                <span>{target.status}</span>
                                            </div>
                                            {target.details && (
                                                <span className="text-xs text-slate-400 font-mono">{target.details}</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="standby"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-slate-500 text-sm font-mono"
                                    >
                                        SELECT SECTOR TO ANALYZE
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Action Button */}
                        <AnimatePresence>
                            {isLocked && target && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onAction}
                                    className="flex flex-col items-center justify-center w-20 h-14 rounded-lg bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all group"
                                >
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    <span className="text-[8px] font-bold tracking-wider uppercase mt-1">
                                        {actionLabel}
                                    </span>
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
