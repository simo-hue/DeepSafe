import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, AlertTriangle } from 'lucide-react';

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose, featureName = "Questa funzionalità" }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-sm bg-[#0B0C10] border border-amber-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.1)]"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                                <Clock className="w-8 h-8 text-amber-500" />
                            </div>

                            <h3 className="text-xl font-bold text-white font-orbitron mb-2">
                                PROSSIMAMENTE
                            </h3>

                            <p className="text-slate-400 text-sm mb-6">
                                {featureName} è in fase di sviluppo. Stiamo lavorando per portarti la migliore esperienza possibile.
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors font-orbitron text-sm"
                            >
                                HO CAPITO
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
