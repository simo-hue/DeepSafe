'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Users, Zap, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { missionsData } from '@/data/missionsData';
import { provincesData } from '@/data/provincesData';

export default function MissionSelectionPage() {
    const params = useParams();
    const router = useRouter();
    const provinceId = params.provinceId as string;
    const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

    const province = provincesData.find(p => p.id === provinceId);
    const missions = missionsData[provinceId] || [];

    if (!province) {
        return <div className="text-white p-8">Provincia non trovata.</div>;
    }

    const handleBack = () => {
        router.back();
    };

    const handleMissionClick = (missionId: string) => {
        setSelectedMissionId(selectedMissionId === missionId ? null : missionId);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400 border-green-400/30 bg-green-400/10';
            case 'Medium': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            case 'Hard': return 'text-red-400 border-red-400/30 bg-red-400/10';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-cyber-blue selection:text-slate-900 pb-24 relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-cyber-blue/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-cyber-purple/10 blur-[80px] rounded-full" />
            </div>

            <TopBar />

            <main className="pt-40 px-4 max-w-md mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <button
                        onClick={handleBack}
                        className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyber-blue/50 hover:bg-cyber-blue/10 transition-all duration-300 backdrop-blur-sm group"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-cyber-blue transition-colors" />
                    </button>
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col"
                        >
                            <span className="text-[10px] font-mono text-cyber-blue uppercase tracking-[0.2em] mb-1">Mission Control</span>
                            <h1 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                {province.name}
                            </h1>
                        </motion.div>
                    </div>
                </div>

                {/* Missions List */}
                <div className="space-y-6">
                    {missions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700/50 text-center backdrop-blur-md"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                <Lock className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-300 mb-2">Nessuna Missione</h3>
                            <p className="text-sm text-slate-500">
                                Non ci sono missioni attive in questo settore al momento.
                            </p>
                        </motion.div>
                    ) : (
                        missions.map((mission, index) => (
                            <motion.div
                                key={mission.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`rounded-3xl border transition-all duration-500 overflow-hidden ${selectedMissionId === mission.id
                                        ? 'bg-slate-800/90 border-cyber-blue shadow-[0_0_30px_rgba(102,252,241,0.15)]'
                                        : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/60'
                                    } backdrop-blur-md`}
                            >
                                {/* Mission Header Card */}
                                <button
                                    onClick={() => handleMissionClick(mission.id)}
                                    className="w-full p-6 text-left flex items-start space-x-5"
                                >
                                    <div className={`p-4 rounded-2xl transition-colors duration-300 ${selectedMissionId === mission.id
                                            ? 'bg-cyber-blue/20 text-cyber-blue shadow-[0_0_15px_rgba(102,252,241,0.3)]'
                                            : 'bg-slate-700/30 text-slate-400'
                                        }`}>
                                        <Target className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3 className={`font-bold text-xl mb-2 font-orbitron ${selectedMissionId === mission.id ? 'text-white text-glow' : 'text-slate-200'
                                            }`}>
                                            {mission.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {mission.description}
                                        </p>
                                    </div>
                                </button>

                                {/* Problems (Accordion Content) */}
                                <AnimatePresence>
                                    {selectedMissionId === mission.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-700/50 bg-slate-900/50"
                                        >
                                            <div className="p-5 space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyber-blue/50 to-transparent" />
                                                    <span className="text-[10px] font-orbitron text-cyber-blue uppercase tracking-widest">
                                                        Seleziona Obiettivo
                                                    </span>
                                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyber-blue/50 to-transparent" />
                                                </div>

                                                {mission.problems.map((problem, pIndex) => (
                                                    <motion.div
                                                        key={problem.id}
                                                        initial={{ x: -20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: pIndex * 0.1 }}
                                                        className="group relative p-5 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-cyber-blue/50 transition-all duration-300 cursor-pointer overflow-hidden"
                                                    >
                                                        {/* Hover Gradient */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/0 via-cyber-blue/5 to-cyber-blue/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                                        <div className="relative z-10">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getDifficultyColor(problem.difficulty)}`}>
                                                                        {problem.difficulty}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded-full border border-slate-700">
                                                                    <Users className="w-3 h-3" />
                                                                    <span>{problem.character}</span>
                                                                </div>
                                                            </div>

                                                            <h5 className="font-bold text-white text-lg mb-2 group-hover:text-cyber-blue transition-colors">
                                                                {problem.title}
                                                            </h5>
                                                            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                                                                {problem.description}
                                                            </p>

                                                            <button className="w-full py-3 rounded-xl bg-slate-700 group-hover:bg-cyber-blue text-white group-hover:text-slate-900 font-bold font-orbitron text-sm transition-all duration-300 shadow-lg group-hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] flex items-center justify-center space-x-2">
                                                                <span>RISOLVI ORA</span>
                                                                <Zap className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
