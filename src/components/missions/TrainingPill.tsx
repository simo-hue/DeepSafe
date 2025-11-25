import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, AlertTriangle, Brain, Trophy } from 'lucide-react';

export interface TrainingModule {
    id: string;
    title: string;
    briefing: {
        text: string;
        keyPoints: string[];
    };
    quiz: {
        question: string;
        options: { id: string; text: string; isCorrect: boolean }[];
        explanation: string;
    };
    xpReward: number;
}

interface TrainingPillProps {
    module: TrainingModule;
    onComplete: (success: boolean, xp: number) => void;
    onClose: () => void;
}

const TrainingPill: React.FC<TrainingPillProps> = ({ module, onComplete, onClose }) => {
    const [step, setStep] = useState<'briefing' | 'quiz' | 'result'>('briefing');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleQuizSubmit = () => {
        if (!selectedOption) return;

        const correct = module.quiz.options.find(o => o.id === selectedOption)?.isCorrect || false;
        setIsCorrect(correct);
        setStep('result');

        if (correct) {
            // Trigger success sound/effect here
        }
    };

    const handleClose = () => {
        if (step === 'result' && isCorrect) {
            onComplete(true, module.xpReward);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] relative max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                            <Brain className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-orbitron font-bold text-white tracking-wide truncate">
                                TRAINING MODULE
                            </h2>
                            <p className="text-[10px] md:text-xs font-mono text-cyan-500/70 uppercase truncate">
                                {module.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <AnimatePresence mode="wait">
                        {step === 'briefing' && (
                            <motion.div
                                key="briefing"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col h-full"
                            >
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Briefing Operativo</h3>
                                <p className="text-slate-300 leading-relaxed mb-6 md:mb-8 text-base md:text-lg">
                                    {module.briefing.text}
                                </p>

                                <div className="space-y-3 md:space-y-4 mb-8">
                                    <h4 className="text-xs md:text-sm font-mono text-cyan-400 uppercase tracking-widest mb-2">Punti Chiave</h4>
                                    {module.briefing.keyPoints.map((point, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] shrink-0" />
                                            <span className="text-slate-300 text-sm">{point}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-4 flex justify-end">
                                    <button
                                        onClick={() => setStep('quiz')}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold font-orbitron hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                                    >
                                        <span>AVVIA SIMULAZIONE</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'quiz' && (
                            <motion.div
                                key="quiz"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col h-full"
                            >
                                <div className="mb-6 md:mb-8">
                                    <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-4">
                                        QUIZ DI VERIFICA
                                    </span>
                                    <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                                        {module.quiz.question}
                                    </h3>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {module.quiz.options.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSelectedOption(option.id)}
                                            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${selectedOption === option.id
                                                ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <span className="font-medium text-sm md:text-base pr-4">{option.text}</span>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selectedOption === option.id
                                                ? 'border-cyan-400 bg-cyan-400 text-slate-900'
                                                : 'border-slate-600 group-hover:border-slate-500'
                                                }`}>
                                                {selectedOption === option.id && <div className="w-2 h-2 bg-current rounded-full" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-auto pt-4 flex justify-end">
                                    <button
                                        onClick={handleQuizSubmit}
                                        disabled={!selectedOption}
                                        className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold font-orbitron transition-all ${selectedOption
                                            ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <span>CONFERMA RISPOSTA</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'result' && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center py-4 md:py-8 h-full"
                            >
                                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 md:mb-6 ${isCorrect
                                    ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
                                    : 'bg-rose-500/20 border-2 border-rose-500 text-rose-400 shadow-[0_0_50px_rgba(244,63,94,0.3)]'
                                    }`}>
                                    {isCorrect ? <Trophy className="w-8 h-8 md:w-10 md:h-10" /> : <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" />}
                                </div>

                                <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-2">
                                    {isCorrect ? 'MISSIONE COMPIUTA' : 'FALLIMENTO SISTEMA'}
                                </h3>

                                <p className="text-slate-400 max-w-md mx-auto mb-6 md:mb-8 text-sm md:text-base">
                                    {isCorrect
                                        ? `Ottimo lavoro! Hai guadagnato ${module.xpReward} XP e messo in sicurezza il settore.`
                                        : 'La risposta non è corretta. Rivedi il briefing e riprova per sbloccare il settore.'
                                    }
                                </p>

                                {isCorrect && (
                                    <div className="mb-6 md:mb-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-left w-full max-w-md">
                                        <h4 className="text-xs font-mono text-emerald-400 uppercase mb-2">Analisi Tattica</h4>
                                        <p className="text-sm text-slate-300">{module.quiz.explanation}</p>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                                    {!isCorrect && (
                                        <button
                                            onClick={() => {
                                                setStep('briefing');
                                                setSelectedOption(null);
                                                setIsCorrect(null);
                                            }}
                                            className="w-full md:w-auto px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:border-white hover:text-white transition-colors font-bold font-orbitron"
                                        >
                                            RIPROVA
                                        </button>
                                    )}
                                    <button
                                        onClick={handleClose}
                                        className="w-full md:w-auto px-8 py-3 rounded-xl bg-white text-slate-950 font-bold font-orbitron hover:bg-cyan-50 transition-colors shadow-lg"
                                    >
                                        {isCorrect ? 'COMPLETA' : 'ESCI'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default TrainingPill;
