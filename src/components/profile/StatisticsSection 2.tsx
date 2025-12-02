import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Target, Zap, Trophy, Activity, Crosshair, Lock } from 'lucide-react';
import { PremiumLockOverlay } from './PremiumLockOverlay';
import { PremiumModal } from './PremiumModal';
import { ComingSoonModal } from '../common/ComingSoonModal';
import { useUserStore } from '@/store/useUserStore';

interface StatisticsSectionProps {
    isPremium: boolean;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ isPremium }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
    // const setPremium = useUserStore(state => state.setPremium); // REMOVED: Insecure client-side update
    const router = useRouter();
    const provinceScores = useUserStore(state => state.provinceScores);
    const xp = useUserStore(state => state.xp);
    const globalRank = useUserStore(state => state.globalRank) || 0;
    const totalMissions = useUserStore(state => state.totalMissions) || 0; // Use dynamic count from store

    // Calculate Completed Missions from user progress
    const completedMissions = Object.values(provinceScores).reduce((acc, p) => {
        return acc + (p.missions ? Object.values(p.missions).filter(m => m.isCompleted).length : 0);
    }, 0);

    console.log('Stats Debug:', { totalMissions, completedMissions, provinceScores });

    // Ensure totalMissions is at least equal to completedMissions to avoid > 100%
    const effectiveTotal = Math.max(totalMissions, completedMissions);
    const missionCompletionRate = effectiveTotal > 0 ? Math.round((completedMissions / effectiveTotal) * 100) : 0;

    // Calculate Accuracy
    let totalScore = 0;
    let totalMaxScore = 0;
    Object.values(provinceScores).forEach(p => {
        totalScore += p.score;
        totalMaxScore += p.maxScore;
        if (p.missions) {
            Object.values(p.missions).forEach(m => {
                totalScore += m.score;
                totalMaxScore += m.maxScore;
            });
        }
    });
    const accuracy = totalMaxScore > 0 ? Math.min(100, Math.round((totalScore / totalMaxScore) * 100)) : 0;



    const handleUpgrade = async () => {
        // await setPremium(true); // REMOVED: Premium is activated via Stripe Webhook
        // router.push('/shop'); // CHANGED: Feature coming soon
        setIsModalOpen(false);
        setIsComingSoonOpen(true);
    };

    return (
        <>
            <div className="bg-black/40 border border-cyber-gray/30 rounded-xl p-6 space-y-6 relative overflow-hidden">
                {/* Background Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/5 blur-[40px] rounded-full pointer-events-none" />

                {/* Header */}
                <h3 className="text-lg font-bold font-orbitron text-white flex items-center gap-2 relative z-10">
                    <Activity className="w-5 h-5 text-cyber-blue" />
                    PRESTAZIONI AGENTE
                    {isPremium && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            PREMIUM
                        </span>
                    )}
                </h3>

                {/* Content Container */}
                <div className={`space-y-6 relative z-10 ${!isPremium ? 'blur-sm select-none pointer-events-none opacity-50' : ''}`}>

                    {/* Stat Item 1: Mission Completion */}
                    <StatItem
                        icon={<Target className="w-5 h-5" />}
                        label="COMPLETAMENTO MISSIONI"
                        value={`${missionCompletionRate}%`}
                        subtext={`${completedMissions}/${effectiveTotal} Completate`}
                        color="emerald"
                    />

                    {/* Stat Item 2: Accuracy */}
                    <StatItem
                        icon={<Crosshair className="w-5 h-5" />}
                        label="PRECISIONE TATTICA"
                        value={`${accuracy}%`}
                        subtext="Media Risposte Corrette"
                        color="blue"
                    />

                    {/* Stat Item 3: Global Rank */}
                    <StatItem
                        icon={<Trophy className="w-5 h-5" />}
                        label="RANK GLOBALE"
                        value={`#${globalRank}`}
                        subtext="Top 15% Agenti"
                        color="amber"
                    />

                    {/* Stat Item 4: Playstyle */}
                    <StatItem
                        icon={<Zap className="w-5 h-5" />}
                        label="STILE DI GIOCO"
                        value="TATTICO"
                        subtext="Focus: Strategia e Analisi"
                        color="purple"
                    />
                </div>

                {/* Lock Overlay for Free Users */}
                {!isPremium && (
                    <PremiumLockOverlay onUnlock={() => setIsModalOpen(true)} />
                )}

                {/* View Full Report Button (Premium Only) */}
                {isPremium && (
                    <div className="pt-4 border-t border-white/5">
                        <Link
                            href="/profile/stats"
                            className="w-full block text-center py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold font-orbitron text-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
                        >
                            VISUALIZZA RAPPORTO COMPLETO
                        </Link>
                    </div>
                )}
            </div>

            {/* Upgrade Modal */}
            <PremiumModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpgrade={handleUpgrade}
            />

            <ComingSoonModal
                isOpen={isComingSoonOpen}
                onClose={() => setIsComingSoonOpen(false)}
                featureName="L'abbonamento Premium"
            />
        </>
    );
};

const StatItem = ({ icon, label, value, subtext, color }: { icon: React.ReactNode, label: string, value: string, subtext: string, color: string }) => {
    const colorClasses = {
        emerald: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20',
        blue: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20',
        amber: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20',
        purple: 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20',
    };

    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}>
                    {icon}
                </div>
                <div>
                    <div className="text-sm font-bold text-white font-orbitron tracking-wide">{label}</div>
                    <div className="text-xs text-zinc-500 font-mono">{subtext}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-lg font-bold text-white font-orbitron">{value}</div>
            </div>
        </div>
    );
};
