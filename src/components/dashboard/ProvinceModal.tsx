'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, MapPin, ShieldAlert, ChevronRight } from 'lucide-react';
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

    // Theme configuration based on status
    const theme = isLocked ? {
        color: 'text-cyber-red',
        borderColor: 'border-cyber-red',
        bgColor: 'bg-cyber-red/10',
        glowColor: 'shadow-[0_0_50px_rgba(255,50,50,0.2)]',
        buttonBg: 'hover:bg-cyber-red/20',
        buttonBorder: 'hover:border-white',
        buttonShadow: 'shadow-[0_0_20px_rgba(255,50,50,0.5)] hover:shadow-[0_0_50px_rgba(255,50,50,0.8)]',
        icon: <Lock className="w-6 h-6" />,
        title: 'ACCESSO NEGATO',
        description: `Il settore ${province.name} è attualmente bloccato. Completa le missioni nei settori adiacenti per ottenere i codici di accesso.`,
        buttonText: 'CHIUDI',
        securityLevel: 'ESTREMO',
        action: onClose
    } : {
        color: 'text-cyber-blue',
        borderColor: 'border-cyber-blue',
        bgColor: 'bg-cyber-blue/10',
        glowColor: 'shadow-[0_0_50px_rgba(102,252,241,0.2)]',
        buttonBg: 'hover:bg-cyber-blue/20',
        buttonBorder: 'hover:border-white',
        buttonShadow: 'shadow-[0_0_20px_rgba(102,252,241,0.5)] hover:shadow-[0_0_50px_rgba(102,252,241,0.8)]',
        icon: <MapPin className="w-6 h-6" />,
        title: hasMultipleMissions ? 'MISSIONI DISPONIBILI' : province.name,
        description: hasMultipleMissions
            ? `Rilevate multiple anomalie nel settore ${province.name}. Seleziona un obiettivo prioritario.`
            : (singleMission?.description || `Rilevata attività anomala nel settore ${province.name}. Protocolli di sicurezza compromessi. Richiesto intervento immediato per ripristinare il firewall regionale.`),
        buttonText: 'VAI ALLA MISSIONE',
        securityLevel: hasMultipleMissions ? 'VARIO' : (singleMission?.level || 'CRITICO'),
        action: () => router.push(`/training/mission-1?provinceId=${province.id}`)
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                />
            </AnimatePresence>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={`relative w-full max-w-sm bg-slate-900 border ${theme.borderColor} rounded-2xl p-6 ${theme.glowColor} overflow-hidden flex flex-col max-h-[80vh]`}
            >
                {/* Background Grid Effect */}
                <div className={`absolute inset-0 ${theme.bgColor} opacity-20`}
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }}
                />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-6 overflow-y-auto custom-scrollbar">

                    {/* Icon Circle */}
                    <div className={`w-20 h-20 rounded-full border-2 ${theme.borderColor} flex items-center justify-center ${theme.color} bg-slate-800/50 shadow-[0_0_30px_currentColor] shrink-0`}>
                        {theme.icon}
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2 w-full">
                        <div className={`text-xs font-orbitron font-bold tracking-widest ${theme.color} border border-current px-2 py-1 rounded inline-block mb-2`}>
                            LIVELLO SICUREZZA: {theme.securityLevel}
                        </div>
                        <h2 className="text-2xl font-orbitron font-bold text-white tracking-wide">
                            {theme.title}
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {theme.description}
                        </p>

                        {/* Multiple Missions Stack */}
                        {!isLocked && hasMultipleMissions && (
                            <div className="flex flex-col gap-3 mt-4 w-full text-left">
                                {missions.map((mission) => (
                                    <button
                                        key={mission.id}
                                        onClick={() => router.push(`/training/mission-1?provinceId=${province.id}&missionId=${mission.id}`)}
                                        className="group relative p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{mission.title}</h3>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                                                {mission.level || 'SEMPLICE'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                                            <span className="flex items-center gap-1">
                                                <span className="text-amber-400">★</span> {mission.xpReward} XP
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span>⏱</span> {mission.estimatedTime}
                                            </span>
                                        </div>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Score Display for Completed Provinces */}
                        {province.isCompleted && !hasMultipleMissions && (
                            <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700 justify-center mt-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Punteggio</span>
                                    <span className="text-xl font-bold text-amber-400 font-orbitron">
                                        {province.userScore}/{province.maxScore}
                                    </span>
                                </div>
                                <div className="h-8 w-[1px] bg-slate-700" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Stato</span>
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                        Completato
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Button (Only for Single Mission or Locked) */}
                    {(!hasMultipleMissions || isLocked) && (
                        <button
                            onClick={theme.action}
                            className={`w-full py-4 rounded-xl bg-slate-800 border border-slate-600 text-white font-orbitron font-bold tracking-wider transition-all duration-300 group relative overflow-hidden ${theme.buttonBg} ${theme.buttonBorder} ${theme.buttonShadow} shrink-0`}
                        >
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                                <span>{theme.buttonText}</span>
                                {!isLocked && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </span>
                            {/* Button Glare Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                    )}
                </div>

                {/* Decorative Corner Accents */}
                <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${theme.borderColor}/30 rounded-bl-xl pointer-events-none`} />
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${theme.borderColor}/30 rounded-br-xl pointer-events-none`} />
            </motion.div>
        </div>
    );
}
