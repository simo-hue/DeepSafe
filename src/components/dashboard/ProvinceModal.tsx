'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, MapPin, ShieldAlert, ChevronRight, Crosshair, Scan, Target } from 'lucide-react';
import { Province } from '@/data/provincesData';
import { getLessonsForProvince, TrainingLesson } from '@/data/quizData';
import { useRouter } from 'next/navigation';

interface ProvinceModalProps {
    province: Province | null;
    onClose: () => void;
}

export default function ProvinceModal({ province, onClose }: ProvinceModalProps) {
    const router = useRouter();
    const [missions, setMissions] = React.useState<TrainingLesson[]>([]);

    React.useEffect(() => {
        if (province) {
            getLessonsForProvince(province.id, province.region).then(setMissions);
        } else {
            setMissions([]);
        }
    }, [province]);

    if (!province) return null;

    const isLocked = province.status === 'locked';
    const hasMultipleMissions = missions.length > 1;
    const singleMission = missions[0];

    // Calculate progress percentage
    const progressPercent = province.maxScore > 0 ? Math.round((province.userScore / province.maxScore) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
                />
            </AnimatePresence>

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                {/* Cyber Grid Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-20"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header Section */}
                <div className="relative p-8 pb-4 z-10">
                    <div className="flex items-center gap-2 text-cyan-500 mb-2">
                        <Scan className="w-4 h-4" />
                        <span className="text-[10px] font-orbitron tracking-[0.2em] uppercase">TARGET: PROVINCE</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white font-sans tracking-tight mb-1">
                        {province.name}
                    </h2>
                    {!isLocked && (
                        <div className="flex items-center gap-2 text-emerald-500 text-xs font-mono">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            ONLINE
                        </div>
                    )}
                    {isLocked && (
                        <div className="flex items-center gap-2 text-red-500 text-xs font-mono">
                            <Lock className="w-3 h-3" />
                            LOCKED
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-900/50 to-transparent" />

                {/* Body Section */}
                <div className="relative p-8 pt-6 z-10 space-y-6">
                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed font-light">
                        {isLocked
                            ? `Accesso al settore ${province.name} negato. Protocolli di sicurezza attivi. Completa le missioni adiacenti per sbloccare.`
                            : (hasMultipleMissions
                                ? `Rilevate multiple anomalie nel settore. Seleziona un obiettivo prioritario per avviare la procedura di contenimento.`
                                : (singleMission?.description || `Rilevata attività anomala. Richiesto intervento immediato.`))
                        }
                    </p>

                    {/* Mission Stack or Single Action */}
                    {!isLocked && (
                        <div className="space-y-3">
                            {hasMultipleMissions ? (
                                // Multiple Missions Stack
                                <div className="flex flex-col gap-3">
                                    {missions.map((mission) => (
                                        <button
                                            key={mission.id}
                                            onClick={() => router.push(`/training/mission-1?provinceId=${province.id}&missionId=${mission.id}`)}
                                            className="group relative flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-300"
                                        >
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                    {mission.title}
                                                </span>
                                                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <span className="text-amber-500">★</span> {mission.xpReward} XP
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span>⏱</span> {mission.estimatedTime}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 group-hover:text-cyan-500 group-hover:border-cyan-900 transition-colors">
                                                {mission.level || 'SEMPLICE'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                // Single Mission Action
                                <button
                                    onClick={() => router.push(`/training/mission-1?provinceId=${province.id}`)}
                                    className="w-full group relative overflow-hidden rounded-xl bg-cyan-950/30 border border-cyan-900/50 p-6 hover:bg-cyan-900/20 hover:border-cyan-500/50 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs font-orbitron text-cyan-500 mb-1">MISSIONE PRINCIPALE</span>
                                            <span className="text-lg font-bold text-white">AVVIA MISSIONE</span>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
                                    </div>
                                    {/* Scanline effect */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Status Bar */}
                <div className="relative bg-slate-900/80 border-t border-slate-800 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded text-[10px] font-bold font-orbitron tracking-wider flex items-center gap-2 ${isLocked
                            ? 'bg-red-950/30 text-red-500 border border-red-900/50'
                            : 'bg-emerald-950/30 text-emerald-500 border border-emerald-900/50'
                            }`}>
                            {isLocked ? <Lock className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            {isLocked ? 'LOCKED' : 'UNLOCKED'}
                        </div>
                        {province.isCompleted && (
                            <span className="text-[10px] font-mono text-emerald-500">
                                COMPLETED
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500">PROGRESS:</span>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-500 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-mono text-cyan-500 w-8 text-right">
                            {progressPercent}%
                        </span>
                    </div>
                </div>

                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/20 rounded-tl-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-500/20 rounded-br-3xl pointer-events-none" />
            </motion.div>
        </div>
    );
}
