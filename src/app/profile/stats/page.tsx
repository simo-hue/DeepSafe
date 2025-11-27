'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, TrendingUp, Zap, PieChart as PieIcon, List } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { XPTrendChart, SkillsRadarChart, MissionPieChart } from '@/components/profile/StatsCharts';

export default function AdvancedStatsPage() {
    const router = useRouter();
    const { isPremium, refreshProfile, fetchAdvancedStats } = useUserStore();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            await refreshProfile();
            const data = await fetchAdvancedStats();
            if (data?.error) {
                setError(data.error);
            } else {
                setStats(data);
            }
            setIsLoading(false);
        };
        init();
    }, [refreshProfile, fetchAdvancedStats]);

    useEffect(() => {
        if (!isLoading && !isPremium) {
            router.push('/profile');
        }
    }, [isPremium, router, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-orbitron animate-pulse">
                CARICAMENTO DATI...
            </div>
        );
    }

    if (!isPremium) return null;

    // Error Modal
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-black/90 border border-red-500/50 rounded-xl p-8 max-w-md w-full text-center relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
                    <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold font-orbitron text-white mb-2">ERRORE SISTEMA</h2>
                    <p className="text-slate-400 font-mono text-sm mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-red-400 font-bold font-orbitron transition-all"
                    >
                        RITORNA AL PROFILO
                    </button>
                </div>
            </div>
        );
    }

    const xpTrendData = stats?.xp_trend || [];
    const missionData = stats?.mission_distribution || [];
    const recentActivity = stats?.recent_activity || [];

    // Use real skills or zeroed data if empty
    const skillsData = stats?.skills?.length ? stats.skills : [
        { subject: 'Combattimento', A: 0, fullMark: 100 },
        { subject: 'Intelligence', A: 0, fullMark: 100 },
        { subject: 'Tecnologia', A: 0, fullMark: 100 },
        { subject: 'Carisma', A: 0, fullMark: 100 },
        { subject: 'Agilità', A: 0, fullMark: 100 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(69,162,158,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(69,162,158,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold font-orbitron text-white tracking-wider flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-500" />
                            ANALISI PRESTAZIONI
                        </h1>
                        <p className="text-xs text-slate-500 font-mono">RAPPORTO DETTAGLIATO AGENTE</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6 relative z-10">

                {/* XP Trend Section */}
                <section className="bg-black/40 border border-cyber-gray/30 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] rounded-full pointer-events-none" />
                    <h2 className="text-lg font-bold font-orbitron text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-cyan-500" />
                        CRESCITA ESPERIENZA (7 GIORNI)
                    </h2>
                    <div className="h-[300px] w-full">
                        {xpTrendData.length > 0 ? (
                            <XPTrendChart data={xpTrendData} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
                                DATI INSUFFICIENTI
                            </div>
                        )}
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6">
                    {/* Skills Radar */}
                    <section className="bg-black/40 border border-cyber-gray/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[40px] rounded-full pointer-events-none" />
                        <h2 className="text-lg font-bold font-orbitron text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-500" />
                            PROFILO COMPETENZE
                        </h2>
                        <div className="h-[300px] w-full">
                            <SkillsRadarChart data={skillsData} />
                        </div>
                    </section>

                    {/* Mission Distribution */}
                    <section className="bg-black/40 border border-cyber-gray/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none" />
                        <h2 className="text-lg font-bold font-orbitron text-white mb-4 flex items-center gap-2">
                            <PieIcon className="w-5 h-5 text-amber-500" />
                            TIPOLOGIA MISSIONI
                        </h2>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            {missionData.length > 0 ? (
                                <MissionPieChart data={missionData} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
                                    NESSUNA MISSIONE COMPLETATA
                                </div>
                            )}
                        </div>
                        {/* Legend */}
                        {missionData.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {missionData.map((entry: any, index: number) => (
                                    <div key={index} className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981'][index % 4] }} />
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

            </main>
        </div>
    );
}
