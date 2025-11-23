'use client';

import { useState, useEffect } from 'react';
import { Download, Smartphone, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = (evt: any) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    if (!supportsPWA || isInstalled) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <button
                    onClick={handleInstall}
                    className="w-full group relative overflow-hidden rounded-xl border border-cyber-blue/30 bg-black/40 p-4 transition-all hover:border-cyber-blue hover:bg-cyber-blue/5"
                >
                    {/* Background Scan Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-blue/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyber-blue/10 text-cyber-blue group-hover:scale-110 transition-transform duration-300 border border-cyber-blue/20 group-hover:border-cyber-blue/50 group-hover:shadow-[0_0_15px_rgba(102,252,241,0.3)]">
                            <Download className="h-6 w-6" />
                        </div>

                        <div className="flex-1 text-left">
                            <h3 className="font-orbitron font-bold text-white group-hover:text-cyber-blue transition-colors text-glow">
                                INSTALLA SISTEMA
                            </h3>
                            <p className="text-xs text-zinc-400 font-mono">
                                Accesso diretto al mainframe
                            </p>
                        </div>

                        <div className="text-cyber-gray group-hover:text-white transition-colors">
                            <Smartphone className="h-5 w-5" />
                        </div>
                    </div>
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
