'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Zap, Trophy, X } from 'lucide-react';
import Link from 'next/link';
import { MissionCard, Mission } from '@/components/gamification/MissionCard';
import { BadgeCard, Badge } from '@/components/gamification/BadgeCard';
import { cn } from '@/lib/utils';

// Mock Data (Replace with Supabase fetch)
const MOCK_MISSIONS: Mission[] = [
    { id: '1', title: 'Daily Login', target_count: 1, current_count: 1, reward_xp: 50, is_completed: true, is_claimed: false, frequency: 'daily' },
    { id: '2', title: 'Quiz Master', target_count: 3, current_count: 2, reward_xp: 150, is_completed: false, is_claimed: false, frequency: 'daily' },
    { id: '3', title: 'Perfect Streak', target_count: 1, current_count: 1, reward_xp: 200, is_completed: true, is_claimed: true, frequency: 'weekly' },
];

const MOCK_BADGES: Badge[] = [
    { id: '1', name: 'First Steps', description: 'Completed your first quiz.', icon_url: '👣', category: 'General', xp_bonus: 50, is_unlocked: true, earned_at: '2024-05-20', rarity: 'common' },
    { id: '2', name: 'Shield Bearer', description: 'Secured account with 2FA.', icon_url: '🛡️', category: 'Defense', xp_bonus: 100, is_unlocked: true, earned_at: '2024-05-21', rarity: 'rare' },
    { id: '3', name: 'Cyber Legend', description: 'Completed the 30-Day Buffer.', icon_url: '👑', category: 'Mastery', xp_bonus: 500, is_unlocked: true, earned_at: '2024-05-24', rarity: 'legendary' },
    { id: '4', name: 'Phishing Terminator', description: 'Reported 10 phishing attempts.', icon_url: '🎣', category: 'Defense', xp_bonus: 200, is_unlocked: false, rarity: 'rare' },
    { id: '5', name: 'Speed Demon', description: 'Finished a quiz in under 30s.', icon_url: '⚡', category: 'Speed', xp_bonus: 100, is_unlocked: false, rarity: 'common' },
    { id: '6', name: 'Social Engineer', description: 'Invited 5 friends.', icon_url: '🤝', category: 'Social', xp_bonus: 150, is_unlocked: false, rarity: 'common' },
];

export default function AchievementsPage() {
    const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
    const [badges, setBadges] = useState<Badge[]>(MOCK_BADGES);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    const handleClaimMission = (id: string) => {
        setMissions(prev => prev.map(m =>
            m.id === id ? { ...m, is_claimed: true } : m
        ));
        // Trigger particle effect here
    };

    return (
        <div className="min-h-screen bg-cyber-dark pb-24 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-blue/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-purple/10 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 p-4 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-cyber-gray/50 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-cyber-blue" />
                    </Link>
                    <h1 className="text-2xl font-bold font-orbitron text-white tracking-wider">
                        CYBER VAULT
                    </h1>
                </div>

                {/* Mission Control */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-cyber-blue mb-2">
                        <Shield className="w-5 h-5" />
                        <h2 className="font-bold font-orbitron tracking-wide text-sm">MISSION CONTROL</h2>
                    </div>

                    <div className="grid gap-3">
                        {missions.map(mission => (
                            <MissionCard
                                key={mission.id}
                                mission={mission}
                                onClaim={handleClaimMission}
                            />
                        ))}
                    </div>
                </section>

                {/* Artifact Grid */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-cyber-purple mb-2">
                        <Trophy className="w-5 h-5" />
                        <h2 className="font-bold font-orbitron tracking-wide text-sm">ARTIFACT GRID</h2>
                    </div>

                    {/* Hex Grid Layout */}
                    {/* Hex Grid Layout - Honeycomb */}
                    <div className="flex flex-wrap justify-center max-w-3xl mx-auto pb-12 px-4">
                        {badges.map((badge) => (
                            <div key={badge.id} className="honeycomb-cell">
                                <BadgeCard badge={badge} onClick={setSelectedBadge} />
                            </div>
                        ))}
                    </div>

                    <style jsx global>{`
                        .honeycomb-cell {
                            margin: 0 4px -22px 4px; /* Negative bottom margin nestles rows */
                        }

                        /* Mobile: 2 Columns */
                        @media (max-width: 639px) {
                            /* Shift every odd row (items 3,4; 7,8; etc.) */
                            /* Pattern: 2 items per row. Row 2 starts at item 3. */
                            /* We want to shift the FIRST item of every EVEN row. */
                            /* Rows: 1(1,2), 2(3,4), 3(5,6), 4(7,8) */
                            /* Items needing shift: 3, 7, 11... -> 4n + 3 */
                            .honeycomb-cell:nth-child(4n + 3) {
                                margin-left: 54px; /* Half width (50px) + gap (4px) */
                            }
                        }

                        /* Desktop: 3 Columns */
                        @media (min-width: 640px) {
                            /* Pattern: 3 items per row. Row 2 starts at item 4. */
                            /* Rows: 1(1,2,3), 2(4,5,6), 3(7,8,9) */
                            /* Items needing shift: 4, 10, 16... -> 6n + 4 */
                            .honeycomb-cell:nth-child(6n + 4) {
                                margin-left: 54px;
                            }
                        }
                    `}</style>
                </section>
            </div>

            {/* Badge Inspection Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                        onClick={() => setSelectedBadge(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="bg-cyber-dark border border-cyber-blue/30 rounded-2xl p-1 max-w-sm w-full relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedBadge(null)}
                                className="absolute top-4 right-4 text-cyber-gray hover:text-white z-20"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Holographic Background */}
                            <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/5 to-transparent pointer-events-none" />

                            <div className="flex flex-col items-center text-center p-6 space-y-6 relative z-10">
                                {/* 3D Floating Badge */}
                                <div className="w-32 h-32 relative animate-float">
                                    <div className="absolute inset-0 bg-cyber-blue/20 blur-2xl rounded-full animate-pulse" />
                                    <div className="text-6xl relative z-10 drop-shadow-[0_0_20px_rgba(69,162,158,0.8)]">
                                        {selectedBadge.icon_url}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold font-orbitron text-white text-glow">
                                        {selectedBadge.name}
                                    </h3>
                                    <div className={cn(
                                        "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                                        selectedBadge.rarity === 'legendary' ? "border-amber-500 text-amber-500 bg-amber-500/10" :
                                            selectedBadge.rarity === 'rare' ? "border-cyber-purple text-cyber-purple bg-cyber-purple/10" :
                                                "border-cyber-blue text-cyber-blue bg-cyber-blue/10"
                                    )}>
                                        {selectedBadge.rarity} Artifact
                                    </div>
                                </div>

                                <p className="text-zinc-400 italic">
                                    "{selectedBadge.description}"
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-cyber-gray/20">
                                    <div className="text-center">
                                        <div className="text-xs text-cyber-gray font-mono uppercase">XP BONUS</div>
                                        <div className="text-xl font-bold text-cyber-green">+{selectedBadge.xp_bonus}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-cyber-gray font-mono uppercase">EARNED ON</div>
                                        <div className="text-sm font-bold text-white">
                                            {selectedBadge.earned_at ? new Date(selectedBadge.earned_at).toLocaleDateString() : 'LOCKED'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
