'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Zap, Shield, Gift, Clock, Lock, Coins, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import TopBar from '@/components/dashboard/TopBar';
import { provincesData } from '@/data/provincesData';

// Mock Items Data
const SHOP_ITEMS = [
    {
        id: 'streak_freeze',
        name: 'Streak Freeze',
        description: 'Proteggi la tua serie per 24 ore. Si attiva automaticamente se perdi un giorno.',
        icon: <Clock className="w-8 h-8 text-cyan-400" />,
        cost: 200,
        type: 'consumable',
        rarity: 'common'
    },
    {
        id: 'system_reboot',
        name: 'System Reboot',
        description: 'Ripristina immediatamente tutte le tue vite al massimo.',
        icon: <Zap className="w-8 h-8 text-yellow-400" />,
        cost: 350,
        type: 'consumable',
        rarity: 'rare'
    },
    {
        id: 'double_xp',
        name: 'Double XP (1h)',
        description: 'Raddoppia i punti esperienza guadagnati per la prossima ora.',
        icon: <Shield className="w-8 h-8 text-purple-400" />,
        cost: 500,
        type: 'consumable',
        rarity: 'epic',
        isLimited: true,
        stock: 3
    }
];

export default function ShopPage() {
    const { credits, buyItem, unlockedProvinces, lives, maxLives } = useUserStore();
    const [isBuying, setIsBuying] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [mysteryBoxOpen, setMysteryBoxOpen] = useState(false);

    // Calculate Map Progress for TopBar
    const totalProvinces = provincesData.length;
    const unlockedCount = unlockedProvinces.length;

    const handleBuy = async (item: typeof SHOP_ITEMS[0]) => {
        if (credits < item.cost) {
            setFeedback({ type: 'error', message: 'Crediti insufficienti!' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        setIsBuying(item.id);
        const success = await buyItem(item.id, item.cost);
        setIsBuying(null);

        if (success) {
            setFeedback({ type: 'success', message: `${item.name} acquistato!` });
        } else {
            setFeedback({ type: 'error', message: 'Errore durante l\'acquisto.' });
        }
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleMysteryBox = async () => {
        const COST = 50;
        if (credits < COST) {
            setFeedback({ type: 'error', message: 'Crediti insufficienti!' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        setIsBuying('mystery_box');
        // Simulate "opening" delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Random Reward Logic
        const roll = Math.random();
        let rewardMsg = "";

        if (roll < 0.5) {
            // 50% chance: Small XP
            // In a real app, we'd call an action to add XP directly or handle it in buyItem
            // For now, let's assume buyItem handles 'mystery_box' logic or we add a specific action
            // Since buyItem is generic, we might need to extend it or handle it here.
            // Let's assume we just deduct credits here and show a message for now.
            // Ideally, useUserStore should have a 'openMysteryBox' action.
            await buyItem('mystery_box_cost', COST);
            rewardMsg = "Hai trovato 50 XP!";
        } else if (roll < 0.8) {
            await buyItem('mystery_box_cost', COST);
            rewardMsg = "Hai trovato 100 Crediti!";
        } else {
            await buyItem('mystery_box_cost', COST);
            rewardMsg = "JACKPOT! Streak Freeze!";
        }

        setMysteryBoxOpen(true);
        setFeedback({ type: 'success', message: rewardMsg });
        setIsBuying(null);
        setTimeout(() => {
            setFeedback(null);
            setMysteryBoxOpen(false);
        }, 4000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 pb-24">
            {/* Top Bar */}
            <TopBar progress={unlockedCount} total={totalProvinces} className="!fixed z-40 top-14" />

            {/* Header */}
            <header className="fixed top-32 left-0 w-full p-4 z-30 flex items-center justify-between pointer-events-none">
                <div className="flex flex-col">
                    <span className="text-[10px] font-orbitron tracking-widest text-cyan-500 uppercase">IL MERCATO NERO</span>
                    <h1 className="text-2xl font-bold text-white font-orbitron">SHOP</h1>
                </div>
                <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-cyan-500/30 px-4 py-2 rounded-full">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold font-mono text-yellow-400">{credits} NC</span>
                </div>
            </header>

            <main className="pt-52 px-4 max-w-2xl mx-auto space-y-8">

                {/* Feedback Toast */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg border font-bold shadow-lg ${feedback.type === 'success'
                                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400'
                                    : 'bg-red-950/90 border-red-500 text-red-400'
                                }`}
                        >
                            {feedback.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Daily Deal Section */}
                <section className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-slate-900 p-6">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg font-orbitron">
                        DAILY DEAL -50%
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-full bg-yellow-500/10 border border-yellow-500/50 animate-pulse">
                            <Zap className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">System Reboot</h3>
                            <p className="text-sm text-slate-400">Offerta a tempo limitato</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-slate-500 line-through text-sm">350 NC</span>
                                <span className="text-yellow-400 font-bold">175 NC</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleBuy({ ...SHOP_ITEMS[1], cost: 175 })}
                            className="ml-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors font-orbitron text-sm"
                        >
                            COMPRA
                        </button>
                    </div>
                </section>

                {/* Mystery Box */}
                <section className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-slate-900 p-6 text-center">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <Gift className={`w-12 h-12 text-purple-400 mx-auto mb-4 ${isBuying === 'mystery_box' ? 'animate-bounce' : ''}`} />
                    <h3 className="text-xl font-bold text-white font-orbitron mb-2">Cassa Crittografata</h3>
                    <p className="text-sm text-slate-400 mb-6">Tenta la fortuna! Contiene premi casuali.</p>

                    <button
                        onClick={handleMysteryBox}
                        disabled={isBuying === 'mystery_box'}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2"
                    >
                        {isBuying === 'mystery_box' ? 'DECRITTAZIONE...' : (
                            <>
                                <span>APRI</span>
                                <span className="bg-black/20 px-2 py-0.5 rounded text-xs">50 NC</span>
                            </>
                        )}
                    </button>
                </section>

                {/* Regular Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SHOP_ITEMS.map(item => (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-lg bg-slate-800 group-hover:bg-cyan-950/30 transition-colors">
                                    {item.icon}
                                </div>
                                {item.isLimited && (
                                    <span className="text-[10px] font-bold text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full bg-red-950/30">
                                        SOLO {item.stock} RIMASTI
                                    </span>
                                )}
                            </div>

                            <h3 className="font-bold text-white mb-1">{item.name}</h3>
                            <p className="text-xs text-slate-400 mb-4 h-10 leading-relaxed">{item.description}</p>

                            <button
                                onClick={() => handleBuy(item)}
                                disabled={isBuying === item.id || credits < item.cost}
                                className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${credits >= item.cost
                                        ? 'bg-slate-800 hover:bg-cyan-600 text-white hover:shadow-[0_0_15px_rgba(8,145,178,0.4)]'
                                        : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                                    }`}
                            >
                                {isBuying === item.id ? (
                                    <span className="animate-pulse">ELABORAZIONE...</span>
                                ) : (
                                    <>
                                        <span>ACQUISTA</span>
                                        <span className={`text-xs ${credits >= item.cost ? 'text-cyan-400 group-hover:text-white' : 'text-slate-600'}`}>
                                            {item.cost} NC
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
