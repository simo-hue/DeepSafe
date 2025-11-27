'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Zap, Shield, Gift, Clock, Lock, Coins, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import TopBar from '@/components/dashboard/TopBar';
import { provincesData } from '@/data/provincesData';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
// Stripe is handled via API redirect, no need to load it here
// import { loadStripe } from '@stripe/stripe-js';
import { MysteryBoxModal } from '@/components/shop/MysteryBoxModal';
import { PurchaseConfirmationModal } from '@/components/shop/PurchaseConfirmationModal';

// Initialize Supabase Client
const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ShopItem = Database['public']['Tables']['shop_items']['Row'];

import { Suspense } from 'react';

function ShopContent() {
    const { credits, buyItem, unlockedProvinces, lives, maxLives, refreshProfile } = useUserStore();
    const [isBuying, setIsBuying] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [mysteryBoxOpen, setMysteryBoxOpen] = useState(false);
    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Confirmation Modal State
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [itemToBuy, setItemToBuy] = useState<ShopItem | null>(null);

    // Calculate Map Progress for TopBar
    const totalProvinces = provincesData.length;
    const unlockedCount = unlockedProvinces.length;

    const searchParams = useSearchParams();

    useEffect(() => {
        fetchShopItems();

        if (searchParams.get('success')) {
            setFeedback({ type: 'success', message: 'Pagamento completato! I crediti sono in arrivo.' });
            // Refresh profile to get updated credits (might take a moment for webhook)
            setTimeout(() => refreshProfile(), 1000);
            setTimeout(() => refreshProfile(), 3000);
        }

        if (searchParams.get('canceled')) {
            setFeedback({ type: 'error', message: 'Pagamento annullato.' });
        }
    }, [searchParams, refreshProfile]);

    const fetchShopItems = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('shop_items')
            .select('*')
            .order('cost', { ascending: true });

        if (error) {
            console.error('Error fetching shop items:', error);
        } else {
            setShopItems(data || []);
        }
        setIsLoading(false);
    };

    const handleBuyCredits = async (pack: 'small' | 'medium' | 'large') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let priceId = '';
            let amount = 0;

            switch (pack) {
                case 'small':
                    priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_SMALL || '';
                    amount = 500;
                    break;
                case 'medium':
                    priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MEDIUM || '';
                    amount = 1200;
                    break;
                case 'large':
                    priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_LARGE || '';
                    amount = 2500;
                    break;
            }

            if (!priceId) {
                setFeedback({ type: 'error', message: 'Configurazione prezzi mancante!' });
                return;
            }

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId,
                    userId: user.id,
                    mode: 'payment',
                    actionType: 'BUY_CREDITS',
                    metadata: { amount } // Pass amount to verify in webhook if needed
                }),
            });

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('Errore redirect checkout');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setFeedback({ type: 'error', message: 'Errore durante il checkout.' });
        }
    };

    const buyMysteryItem = async (itemId: string, itemCost: number) => {
        console.log('🎁 Mystery Item Clicked:', itemId);

        if (credits < itemCost) {
            console.log('❌ Insufficient credits');
            setFeedback({ type: 'error', message: 'Crediti insufficienti!' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        console.log('🔓 Opening Mystery Box...');
        setIsBuying(itemId);
        setMysteryBoxOpen(true); // Open modal immediately

        try {
            console.log('📡 Calling buyItem RPC...');
            const result = await buyItem(itemId, itemCost);
            console.log('✅ RPC Result:', result);

            // Artificial delay for animation
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsBuying(null);

            if (result.success && result.reward) {
                console.log('🏆 Reward:', result.reward);
                setMysteryReward(result.reward);
                // Refresh shop items to update stock if limited
                fetchShopItems();
            } else {
                console.error('❌ Purchase failed:', result.message);
                setMysteryBoxOpen(false);
                setFeedback({ type: 'error', message: result.message || 'Errore apertura cassa.' });
                setTimeout(() => setFeedback(null), 3000);
            }
        } catch (error) {
            console.error('🔥 Error in buyMysteryItem:', error);
            setIsBuying(null);
            setMysteryBoxOpen(false);
            setFeedback({ type: 'error', message: 'Errore imprevisto.' });
        }
    };

    const handleBuyClick = (item: ShopItem) => {
        // Check if it's a mystery box type - these have their own flow
        if (item.effect_type === 'mystery_box') {
            buyMysteryItem(item.id, item.cost);
            return;
        }

        if (credits < item.cost) {
            setFeedback({ type: 'error', message: 'Crediti insufficienti!' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        // Open Confirmation Modal
        setItemToBuy(item);
        setConfirmModalOpen(true);
    };

    const confirmPurchase = async () => {
        if (!itemToBuy) return;

        setIsBuying(itemToBuy.id);
        const result = await buyItem(itemToBuy.id, itemToBuy.cost);
        setIsBuying(null);
        setConfirmModalOpen(false);

        if (result.success) {
            setFeedback({ type: 'success', message: `${itemToBuy.name} acquistato con successo!` });
            // Refresh shop items to update stock
            fetchShopItems();
        } else {
            setFeedback({ type: 'error', message: result.message || 'Errore durante l\'acquisto.' });
        }
        setTimeout(() => setFeedback(null), 3000);
        setItemToBuy(null);
    };

    const [mysteryReward, setMysteryReward] = useState<{ type: string; value: number } | null>(null);

    // Wrapper for the specific "Cassa Crittografata" section
    const handleMysteryBoxSection = () => {
        buyMysteryItem('mystery_box', 50);
    };

    // Filter items for display
    // Hide items that are limited AND have 0 or less stock
    const availableItems = shopItems.filter(i => !i.is_limited || (i.stock !== null && i.stock > 0));

    const regularItems = availableItems.filter(i => i.id !== 'mystery_box' && i.id !== 'system_reboot'); // Exclude special display items if needed
    const dailyDealItem = availableItems.find(i => i.id === 'system_reboot');

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 pb-24">
            {/* Top Bar */}
            <TopBar progress={unlockedCount} total={totalProvinces} className="!fixed z-40 top-14" />

            <main className="pt-32 md:pt-36 px-4 max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] md:text-xs font-orbitron tracking-widest text-cyan-500 uppercase leading-tight">IL MERCATO NERO</span>
                        <h1 className="text-2xl md:text-3xl font-bold text-white font-orbitron leading-none">SHOP</h1>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg shadow-cyan-900/20">
                        <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                        <span className="font-bold font-mono text-yellow-400 text-sm md:text-base">{credits} NC</span>
                    </div>
                </header>

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

                {isLoading ? (
                    <div className="text-center py-20 text-cyan-500 font-mono animate-pulse">LOADING BLACK MARKET...</div>
                ) : (
                    <>
                        {/* Credit Packs Section */}
                        <section className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center hover:border-cyan-500 transition-colors group relative overflow-hidden">
                                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Coins className="w-8 h-8 text-cyan-400 mb-2" />
                                <h3 className="font-bold text-white text-sm">500 NC</h3>
                                <p className="text-xs text-slate-400 mb-3">Pacchetto Base</p>
                                <button
                                    onClick={() => handleBuyCredits('small')}
                                    className="w-full py-1.5 bg-slate-800 hover:bg-cyan-600 text-white text-xs font-bold rounded transition-colors"
                                >
                                    €4.99
                                </button>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center hover:border-cyan-500 transition-colors group relative overflow-hidden">
                                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl">POPOLARE</div>
                                <Coins className="w-8 h-8 text-cyan-400 mb-2" />
                                <h3 className="font-bold text-white text-sm">1200 NC</h3>
                                <p className="text-xs text-slate-400 mb-3">Bonus +20%</p>
                                <button
                                    onClick={() => handleBuyCredits('medium')}
                                    className="w-full py-1.5 bg-slate-800 hover:bg-cyan-600 text-white text-xs font-bold rounded transition-colors"
                                >
                                    €9.99
                                </button>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center hover:border-cyan-500 transition-colors group relative overflow-hidden">
                                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl">BEST VALUE</div>
                                <Coins className="w-8 h-8 text-yellow-400 mb-2" />
                                <h3 className="font-bold text-white text-sm">2500 NC</h3>
                                <p className="text-xs text-slate-400 mb-3">Bonus +25%</p>
                                <button
                                    onClick={() => handleBuyCredits('large')}
                                    className="w-full py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black text-xs font-bold rounded transition-colors"
                                >
                                    €19.99
                                </button>
                            </div>
                        </section>

                        {/* Daily Deal Section */}
                        {dailyDealItem && (
                            <section className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-slate-900 p-6">
                                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg font-orbitron">
                                    DAILY DEAL -50%
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-full bg-yellow-500/10 border border-yellow-500/50 animate-pulse text-4xl">
                                        {dailyDealItem.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{dailyDealItem.name}</h3>
                                        <p className="text-sm text-slate-400">Offerta a tempo limitato</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-slate-500 line-through text-sm">{dailyDealItem.cost * 2} NC</span>
                                            <span className="text-yellow-400 font-bold">{dailyDealItem.cost} NC</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleBuyClick(dailyDealItem)}
                                        className="ml-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors font-orbitron text-sm"
                                    >
                                        COMPRA
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* Mystery Box */}
                        <section className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-slate-900 p-6 text-center">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                            <Gift className={`w-12 h-12 text-purple-400 mx-auto mb-4 ${isBuying === 'mystery_box' ? 'animate-bounce' : ''}`} />
                            <h3 className="text-xl font-bold text-white font-orbitron mb-2">Cassa Crittografata</h3>
                            <p className="text-sm text-slate-400 mb-6">Tenta la fortuna! Contiene premi casuali.</p>

                            <button
                                onClick={handleMysteryBoxSection}
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

                        <MysteryBoxModal
                            isOpen={mysteryBoxOpen}
                            onClose={() => {
                                setMysteryBoxOpen(false);
                                setMysteryReward(null);
                            }}
                            reward={mysteryReward}
                            isOpening={!!isBuying && (isBuying === 'mystery_box' || shopItems.find(i => i.id === isBuying)?.effect_type === 'mystery_box')}
                        />

                        <PurchaseConfirmationModal
                            isOpen={confirmModalOpen}
                            onClose={() => setConfirmModalOpen(false)}
                            onConfirm={confirmPurchase}
                            item={itemToBuy}
                            isProcessing={!!isBuying}
                        />

                        {/* Regular Items Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {regularItems.map(item => (
                                <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-lg bg-slate-800 group-hover:bg-cyan-950/30 transition-colors text-3xl">
                                            {item.icon}
                                        </div>
                                        {item.is_limited && (
                                            <span className="text-[10px] font-bold text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full bg-red-950/30">
                                                SOLO {item.stock} RIMASTI
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-white mb-1">{item.name}</h3>
                                    <p className="text-xs text-slate-400 mb-4 h-10 leading-relaxed overflow-hidden">{item.description}</p>

                                    <button
                                        onClick={() => handleBuyClick(item)}
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
                    </>
                )}

            </main>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-mono">LOADING SHOP...</div>}>
            <ShopContent />
        </Suspense>
    );
}
