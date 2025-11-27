import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, Zap, Shield, Trophy } from 'lucide-react';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-lg bg-[#0B0C10] border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.15)]"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            {/* Header */}
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6 rotate-3">
                                    <Crown className="w-10 h-10 text-slate-900 fill-slate-900" />
                                </div>
                                <h2 className="text-3xl font-black font-orbitron text-white mb-2">
                                    DEEPSAFE <span className="text-amber-400">PREMIUM</span>
                                </h2>
                                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                    Sblocca il massimo potenziale del tuo profilo agente con funzionalità esclusive.
                                </p>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4 mb-8">
                                <FeatureItem
                                    icon={<Trophy className="w-5 h-5 text-amber-400" />}
                                    title="Statistiche Avanzate"
                                    description="Analisi dettagliata delle tue prestazioni e progressi."
                                />
                                <FeatureItem
                                    icon={<Zap className="w-5 h-5 text-amber-400" />}
                                    title="XP Boost x1.5"
                                    description="Guadagna esperienza più velocemente in ogni missione."
                                />
                                <FeatureItem
                                    icon={<Shield className="w-5 h-5 text-amber-400" />}
                                    title="Badge Esclusivi"
                                    description="Accesso a badge rari riservati ai membri Premium."
                                />
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={onUpgrade}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold font-orbitron text-lg rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center justify-center gap-2 group"
                            >
                                <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                ATTIVA PREMIUM ORA
                            </button>
                            <p className="text-center text-[10px] text-slate-500 mt-4 font-mono">
                                * Simulazione: Nessun pagamento reale richiesto.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-colors">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div>
            <h4 className="text-white font-bold font-orbitron text-sm mb-1">{title}</h4>
            <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
        </div>
    </div>
);
