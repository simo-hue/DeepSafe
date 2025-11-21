'use client';

import { useState, useEffect } from 'react';
import { Heart, Zap, Shield, Crown, Battery, Snowflake, Check, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useSystemUI } from '@/context/SystemUIContext';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Initialize Stripe safely
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Supabase Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ShopPage() {
    const { lives, maxLives, refillLives, hasInfiniteLives, setInfiniteLives } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [adModalOpen, setAdModalOpen] = useState(false);
    const [adCountdown, setAdCountdown] = useState(15);
    const router = useRouter();
    const { showToast, openModal } = useSystemUI();

    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        }
        getUser();
    }, []);

    const handlePurchase = async (priceId: string, mode: 'subscription' | 'payment', actionType: string) => {
        if (!userId) {
            openModal({
                type: 'alert',
                title: 'ACCESS DENIED',
                message: 'Identity verification required to purchase upgrades.',
                actionLabel: 'INITIALIZE LOGIN',
                onAction: () => router.push('/login')
            });
            return;
        }
        setLoading(true);
        try {
            if (!stripePromise) {
                console.error("Stripe key missing");
                showToast("Payment system offline (Missing Config)", "error");
                setLoading(false);
                return;
            }
            const stripe = await stripePromise;
            if (!stripe) throw new Error("Stripe failed to load");

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, userId, mode, actionType }),
            });

            const { url } = await response.json();

            if (url) {
                window.location.href = url;
            } else {
                console.error("No checkout URL returned");
                showToast("Transaction Failed. Please try again.", "error");
            }
        } catch (error) {
            console.error("Purchase failed:", error);
            showToast("System Error: Purchase failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleWatchAd = () => {
        if (!userId) {
            alert("Please log in to watch ads.");
            return;
        }
        setAdModalOpen(true);
        setAdCountdown(15);

        const timer = setInterval(() => {
            setAdCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    completeAd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const completeAd = async () => {
        try {
            const response = await fetch('/api/ad-reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                // Optimistically update UI (or refetch from DB)
                // For now, using store action (which updates local state)
                // Ideally, we should sync with DB state
                useUserStore.setState((state) => ({ lives: Math.min(state.maxLives, state.lives + 1) }));
                alert("Reward granted: +1 Heart!");
            } else {
                alert("Failed to claim reward.");
            }
        } catch (error) {
            console.error("Ad reward error:", error);
        } finally {
            setAdModalOpen(false);
        }
    };

    return (
        <div className="space-y-8 pb-32 relative">
            {/* Header */}
            <div className="text-center space-y-2 pt-4">
                <div className="inline-flex items-center justify-center p-3 bg-cyber-blue/10 rounded-full mb-2 border border-cyber-blue/30 shadow-[0_0_15px_rgba(69,162,158,0.2)]">
                    <Zap className="w-6 h-6 text-cyber-blue fill-current" />
                </div>
                <h1 className="text-3xl font-bold font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-purple text-glow">
                    CYBER SUPPLY DEPOT
                </h1>
                <p className="text-zinc-400 font-mono text-sm">
                    Equip yourself for the digital frontier.
                </p>
            </div>

            {/* Section A: Elite Status (Hero Card) */}
            <section className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                <div className="relative p-6 rounded-3xl border border-yellow-500/50 bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-xl shadow-[0_0_30px_rgba(234,179,8,0.1)] overflow-hidden">

                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Crown className="w-10 h-10 text-white fill-white/20" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center lg:text-left space-y-2">
                            <h2 className="text-2xl font-bold font-orbitron text-white tracking-wide flex items-center justify-center lg:justify-start gap-2">
                                DEEPSAFE ELITE
                                <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500 text-black font-bold">PLUS</span>
                            </h2>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm text-blue-100">
                                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-yellow-400" /> Infinite Lives</span>
                                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-yellow-400" /> No Ads</span>
                                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-yellow-400" /> Double XP</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex-shrink-0 w-full lg:w-auto">
                            <button
                                onClick={() => handlePurchase('price_elite_monthly_id', 'subscription', 'ACTIVATE_PREMIUM')}
                                disabled={hasInfiniteLives || loading}
                                className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-orbitron tracking-wide flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : hasInfiniteLives ? 'PLAN ACTIVE' : 'UPGRADE - €4.99/mo'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section B: Vital Resources (Lives Refill) */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Heart className="w-5 h-5 text-cyber-red" />
                    <h2 className="text-lg font-bold font-orbitron tracking-wide text-white">VITAL RESOURCES</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Single Refill */}
                    <div className="group relative p-5 rounded-2xl border border-white/10 bg-cyber-gray/50 backdrop-blur-xl hover:bg-cyber-gray/70 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-cyber-red/10 border border-cyber-red/20 group-hover:border-cyber-red/50 transition-colors">
                                <Battery className="w-6 h-6 text-cyber-red" />
                            </div>
                            <span className="px-2 py-1 rounded-lg bg-white/5 text-xs font-mono text-zinc-400 border border-white/5">
                                {lives}/{maxLives} HEARTS
                            </span>
                        </div>
                        <div className="space-y-1 mb-4">
                            <h3 className="font-bold text-white">Emergency Refill</h3>
                            <p className="text-xs text-zinc-400">+1 Heart to keep you going.</p>
                        </div>
                        <button
                            onClick={handleWatchAd}
                            disabled={lives >= maxLives || hasInfiniteLives || adModalOpen}
                            className="w-full py-2 rounded-lg border border-cyber-red/30 text-cyber-red hover:bg-cyber-red hover:text-white transition-all font-mono text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {hasInfiniteLives ? 'INFINITE LIVES ACTIVE' : lives >= maxLives ? 'FULL HEALTH' : adModalOpen ? 'WATCHING...' : 'WATCH AD (FREE)'}
                        </button>
                    </div>

                    {/* Card 2: Full Restore */}
                    <div className="group relative p-5 rounded-2xl border border-cyber-green/30 bg-cyber-green/5 backdrop-blur-xl hover:bg-cyber-green/10 transition-all shadow-[0_0_15px_rgba(102,252,241,0.05)]">
                        <div className="absolute top-0 right-0 px-2 py-1 bg-[#66FCF1] text-black text-[10px] font-bold rounded-bl-xl rounded-tr-xl">
                            BEST VALUE
                        </div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-cyber-green/20 border border-cyber-green/30 group-hover:border-cyber-green/60 transition-colors">
                                <Zap className="w-6 h-6 text-cyber-green fill-current" />
                            </div>
                        </div>
                        <div className="space-y-1 mb-4">
                            <h3 className="font-bold text-white">System Reboot</h3>
                            <p className="text-xs text-cyber-green/80">Restore full 5 Hearts instantly.</p>
                        </div>
                        <button
                            onClick={() => handlePurchase('price_reboot_id', 'payment', 'REFILL_HEARTS')}
                            disabled={lives >= maxLives || hasInfiniteLives || loading}
                            className="w-full py-2 rounded-lg bg-[#66FCF1] text-black hover:bg-[#66FCF1]/90 transition-all font-mono text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(102,252,241,0.3)] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '€0.99'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Section C: Tactical Upgrades (Power-ups) */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Shield className="w-5 h-5 text-cyber-blue" />
                    <h2 className="text-lg font-bold font-orbitron tracking-wide text-white">TACTICAL UPGRADES</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Item 1: Streak Freeze */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-cyber-gray/50 backdrop-blur-xl hover:border-cyber-blue/30 transition-all">
                        <div className="flex-shrink-0 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <Snowflake className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white">Streak Freeze</h3>
                            <p className="text-xs text-zinc-400 line-clamp-1">Miss a day without losing your streak.</p>
                        </div>
                        <button
                            onClick={() => handlePurchase('price_streak_freeze_id', 'payment', 'STREAK_FREEZE')}
                            disabled={loading}
                            className="flex-shrink-0 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-sm font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '€1.99'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Dev Tools */}
            <div className="pt-8 border-t border-white/5">
                <button
                    onClick={() => {
                        setInfiniteLives(false);
                        useUserStore.setState({ lives: 0 });
                        alert("Dev Mode: Infinite Lives Disabled & Hearts Reset to 0");
                    }}
                    className="text-xs text-zinc-600 hover:text-zinc-400 underline"
                >
                    [DEV] Reset Status (Enable Ads)
                </button>
            </div>

            {/* Ad Modal */}
            {adModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
                    <div className="w-full max-w-md bg-cyber-dark border border-cyber-gray rounded-2xl p-8 text-center space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyber-gray">
                            <div
                                className="h-full bg-cyber-blue transition-all duration-1000 ease-linear"
                                style={{ width: `${(adCountdown / 15) * 100}%` }}
                            />
                        </div>

                        <div className="w-20 h-20 mx-auto bg-cyber-blue/10 rounded-full flex items-center justify-center animate-pulse">
                            <Zap className="w-10 h-10 text-cyber-blue" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold font-orbitron text-white mb-2">INCOMING TRANSMISSION</h3>
                            <p className="text-zinc-400">Receiving supply drop... Stand by.</p>
                        </div>

                        <div className="text-4xl font-mono font-bold text-cyber-blue">
                            00:{adCountdown.toString().padStart(2, '0')}
                        </div>

                        <p className="text-xs text-zinc-600 uppercase tracking-widest">
                            Do not close this window
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
