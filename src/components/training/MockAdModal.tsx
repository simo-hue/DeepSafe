import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface MockAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReward: () => void;
}

const AD_DURATION = 10; // Seconds

const MockAdModal: React.FC<MockAdModalProps> = ({ isOpen, onClose, onReward }) => {
    const [timeLeft, setTimeLeft] = useState(AD_DURATION);
    const [isMuted, setIsMuted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeLeft(AD_DURATION);
            setIsCompleted(false);

            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsCompleted(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        if (isCompleted) {
            onReward();
            onClose();
        } else {
            // Optional: Show "You will lose reward" warning
            if (confirm("Se chiudi ora perderai la ricompensa. Sei sicuro?")) {
                onClose();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            >
                {/* Ad Content Container */}
                <div className="relative w-full h-full max-w-md mx-auto bg-slate-900 flex flex-col">

                    {/* Header / Timer */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-mono border border-white/10">
                            {isCompleted ? "RICOMPENSA PRONTA" : `PREMIO TRA ${timeLeft}s`}
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Fake Ad Content */}
                    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                        {/* Animated Background Elements */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-500/20 rounded-full blur-[100px]"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.5, 1],
                                x: [-50, 50, -50],
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-pink-500/20 rounded-full blur-[100px]"
                        />

                        {/* Ad Message */}
                        <div className="z-10 text-center p-8">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <span className="text-xs font-bold tracking-widest text-white/50 uppercase mb-4 block">SPONSORED</span>
                                <h2 className="text-4xl font-black text-white mb-4 italic">
                                    CYBER<span className="text-cyan-400">VPN</span>
                                </h2>
                                <p className="text-slate-300 mb-8">
                                    Naviga sicuro. Ovunque. Sempre.
                                    <br />
                                    <span className="text-sm text-slate-400 mt-2 block">Proteggi i tuoi dati con la crittografia quantistica.</span>
                                </p>
                                <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                                    INSTALLA ORA
                                </button>
                            </motion.div>
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                            <motion.div
                                className="h-full bg-cyan-400"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: AD_DURATION, ease: "linear" }}
                            />
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 bg-black flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <span className="font-bold text-white">VPN</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">CyberVPN Ultimate</div>
                                <div className="text-xs text-slate-400">4.9 ★★★★★</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 text-slate-400 hover:text-white"
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MockAdModal;
