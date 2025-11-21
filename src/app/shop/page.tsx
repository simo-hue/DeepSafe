'use client';

import { Heart, Zap, Shield, Crown, Battery, Snowflake, Check, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';

export default function ShopPage() {
    const { lives, maxLives, refillLives, hasInfiniteLives, setInfiniteLives } = useUserStore();

    const handleRefill = () => {
        if (lives < maxLives) {
            refillLives();
            // In a real app, show toast
        }
    };

    const handlePremium = () => {
        setInfiniteLives(true);
        // In a real app, show toast
    };

    return (
        <div className="space-y-8 pb-32">
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
                                onClick={handlePremium}
                                disabled={hasInfiniteLives}
                                className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-orbitron tracking-wide"
                            >
                                {hasInfiniteLives ? 'PLAN ACTIVE' : 'UPGRADE - €4.99/mo'}
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
                                {lives >= maxLives ? 'FULL' : '1 LEFT'}
                            </span>
                        </div>
                        <div className="space-y-1 mb-4">
                            <h3 className="font-bold text-white">Emergency Refill</h3>
                            <p className="text-xs text-zinc-400">+1 Heart to keep you going.</p>
                        </div>
                        <button
                            onClick={handleRefill}
                            disabled={lives >= maxLives || hasInfiniteLives}
                            className="w-full py-2 rounded-lg border border-cyber-red/30 text-cyber-red hover:bg-cyber-red hover:text-white transition-all font-mono text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            WATCH AD (FREE)
                        </button>
                    </div>

                    {/* Card 2: Full Restore */}
                    <div className="group relative p-5 rounded-2xl border border-cyber-green/30 bg-cyber-green/5 backdrop-blur-xl hover:bg-cyber-green/10 transition-all shadow-[0_0_15px_rgba(102,252,241,0.05)]">
                        <div className="absolute top-0 right-0 px-2 py-1 bg-cyber-green text-black text-[10px] font-bold rounded-bl-xl rounded-tr-xl">
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
                            onClick={handleRefill}
                            disabled={lives >= maxLives || hasInfiniteLives}
                            className="flex-shrink-0 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(102,252,241,0.3)]"
                        >
                            €0.99
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
                        <button className="flex-shrink-0 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-sm font-bold transition-all">
                            €1.99
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
