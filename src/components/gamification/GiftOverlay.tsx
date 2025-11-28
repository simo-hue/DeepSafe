'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check, X, Sparkles } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import confetti from 'canvas-confetti';
import { useUserStore } from '@/store/useUserStore';

const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GiftData {
    id: string;
    type: 'credits' | 'xp' | 'item';
    amount: number;
    item_id: string | null;
    message: string;
}

export function GiftOverlay() {
    const [gift, setGift] = useState<GiftData | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const { refreshProfile } = useUserStore();

    useEffect(() => {
        checkForGifts();

        // Subscribe to realtime gifts? 
        // For now, just check on mount. Realtime would be cool but maybe overkill for this step.
        // Let's stick to mount check.
    }, []);

    const checkForGifts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await (supabase
            .from('gifts' as any) as any)
            .select('*')
            .eq('user_id', user.id)
            .eq('is_claimed', false)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (data) {
            setGift(data as unknown as GiftData);
            setIsOpen(true);
            // Play sound?
        }
    };

    const handleOpen = () => {
        setShowContent(true);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06b6d4', '#a855f7', '#fbbf24']
        });
    };

    const handleClaim = async () => {
        if (!gift) return;
        setIsClaiming(true);

        try {
            const { error } = await (supabase.rpc as any)('claim_gift', {
                gift_id: gift.id
            });

            if (error) throw error;

            // Refresh user profile to show new stats
            await refreshProfile();

            setIsOpen(false);
            setGift(null);
            setShowContent(false);

            // Check for more gifts
            checkForGifts();
        } catch (error) {
            console.error('Error claiming gift:', error);
            alert('Errore durante il riscatto del regalo.');
        } finally {
            setIsClaiming(false);
        }
    };

    if (!isOpen || !gift) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
                >
                    {/* Background Effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 blur-[100px] rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    </div>

                    <div className="relative z-10 max-w-md w-full p-4 text-center">
                        {!showContent ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="cursor-pointer group"
                                onClick={handleOpen}
                            >
                                <motion.div
                                    animate={{
                                        y: [0, -20, 0],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative inline-block"
                                >
                                    <Gift className="w-48 h-48 text-cyan-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]" />
                                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full animate-pulse" />

                                    {/* Click hint */}
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                        <span className="text-white font-orbitron tracking-widest text-sm animate-bounce">
                                            TOCCA PER APRIRE
                                        </span>
                                    </div>
                                </motion.div>

                                <h2 className="mt-16 text-3xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 animate-gradient-x tracking-widest">
                                    UN REGALO DAI FOUNDER
                                </h2>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-slate-900/80 border border-cyan-500/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden"
                            >
                                {/* Glitch Effect Line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 animate-scan" />

                                <h3 className="text-xl font-bold font-orbitron text-white mb-2 tracking-wider">
                                    {gift.message}
                                </h3>

                                <div className="py-8 flex flex-col items-center justify-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full" />
                                        {gift.type === 'credits' && <div className="text-6xl">🪙</div>}
                                        {gift.type === 'xp' && <div className="text-6xl">⚡</div>}
                                        {gift.type === 'item' && <div className="text-6xl">📦</div>}
                                    </div>

                                    <div className="text-4xl font-bold text-white font-mono text-glow">
                                        {gift.type === 'item' ? (
                                            <span className="uppercase">{gift.item_id?.replace('_', ' ')}</span>
                                        ) : (
                                            <span>+{gift.amount} <span className="text-sm text-cyan-400 uppercase">{gift.type}</span></span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleClaim}
                                    disabled={isClaiming}
                                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-orbitron tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                                >
                                    {isClaiming ? 'RISCATTO...' : 'RISCATTA ORA'}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
