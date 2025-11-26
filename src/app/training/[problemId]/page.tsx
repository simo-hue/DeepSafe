'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { quizData, TrainingLesson, getLessonForProvince } from '@/data/quizData';
import { provincesData } from '@/data/provincesData';
import { ArrowLeft, CheckCircle, XCircle, Brain, ChevronRight, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUserStore } from '@/store/useUserStore';
import GameOverModal from '@/components/training/GameOverModal';
import MockAdModal from '@/components/training/MockAdModal';
import TopBar from '@/components/dashboard/TopBar';

export default function TrainingPillPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const provinceId = searchParams.get('provinceId');
    const problemId = params?.problemId as string;

    const { addXp, unlockProvince, lives, decrementLives, addHeart, refillLives, unlockedProvinces, updateProvinceScore } = useUserStore();

    const [lesson, setLesson] = useState<TrainingLesson | null>(null);
    const [mode, setMode] = useState<'LESSON' | 'QUIZ' | 'COMPLETE'>('LESSON');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [showGameOver, setShowGameOver] = useState(false);
    const [showAdModal, setShowAdModal] = useState(false);

    // Calculate Map Progress for TopBar
    const totalProvinces = provincesData.length;
    const unlockedCount = unlockedProvinces.length;

    useEffect(() => {
        if (provinceId) {
            // Priority 1: Load by Province ID
            const dynamicLesson = getLessonForProvince(provinceId);
            setLesson(dynamicLesson);
        } else if (problemId && quizData[problemId]) {
            // Priority 2: Load by Content ID (Direct Link)
            setLesson(quizData[problemId]);
        } else {
            // Fallback
            setLesson(getLessonForProvince('DEFAULT'));
        }
    }, [problemId, provinceId]);

    // Check for Game Over
    useEffect(() => {
        if (lives <= 0) {
            setShowGameOver(true);
        }
    }, [lives]);

    const handleWatchAd = async () => {
        setShowGameOver(false);
        setShowAdModal(true);
    };

    const handleAdReward = () => {
        addHeart(1);
        setShowAdModal(false);
    };

    const handleBuyHearts = async () => {
        // Simulate Purchase
        await new Promise(resolve => setTimeout(resolve, 2000));
        refillLives();
        setShowGameOver(false);
    };

    const handleGiveUp = () => {
        router.push('/dashboard');
    };

    if (!lesson) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500">LOADING DATA...</div>;
    }

    const handleStartQuiz = () => {
        setMode('QUIZ');
    };

    const handleOptionSelect = (index: number) => {
        if (isAnswerChecked) return;
        setSelectedOption(index);
    };

    const handleCheckAnswer = () => {
        if (selectedOption === null) return;
        setIsAnswerChecked(true);

        const isCorrect = selectedOption === lesson.questions[currentQuestionIndex].correctAnswer;

        if (isCorrect) {
            setScore(prev => prev + 1);
            addXp(100); // XP Reward per question
        } else {
            decrementLives(); // Penalty
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < lesson.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswerChecked(false);
        } else {
            // Mission Complete
            if (provinceId) {
                unlockProvince(provinceId);
                // Save Score
                updateProvinceScore(provinceId, score, lesson.questions.length, true);
            }
            setMode('COMPLETE');
        }
    };

    const handleExit = () => {
        if (provinceId) {
            const province = provincesData.find(p => p.id === provinceId);
            if (province) {
                router.push(`/dashboard?region=${encodeURIComponent(province.region)}`);
                return;
            }
        }
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-y-auto">
            <GameOverModal
                isOpen={showGameOver}
                onWatchAd={handleWatchAd}
                onBuyHearts={handleBuyHearts}
                onGiveUp={handleGiveUp}
            />

            <MockAdModal
                isOpen={showAdModal}
                onClose={() => setShowAdModal(false)}
                onReward={handleAdReward}
            />

            {/* Top Bar (Map Progress) */}
            <TopBar progress={unlockedCount} total={totalProvinces} className="!fixed z-40 top-14" />

            {/* Header */}
            <header className="fixed top-32 left-0 w-full p-4 z-30 flex items-center justify-between pointer-events-none">
                <button onClick={handleExit} className="pointer-events-auto p-2 rounded-full bg-slate-900/50 hover:bg-slate-800 transition-colors backdrop-blur-md border border-slate-700">
                    <ArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-orbitron tracking-widest text-cyan-500 uppercase">TRAINING MODULE</span>
                    <span className="text-sm font-bold text-white">{lesson.title}</span>
                </div>
                <div className="w-9" /> {/* Spacer */}
            </header>

            <main className="pt-52 pb-12 px-4 max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                    {mode === 'LESSON' && (
                        <motion.div
                            key="lesson"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="prose prose-invert prose-cyan max-w-none">
                                <ReactMarkdown>{lesson.content}</ReactMarkdown>
                            </div>

                            <div className="pt-8 flex justify-center">
                                <button
                                    onClick={handleStartQuiz}
                                    className="px-8 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-orbitron tracking-wider shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all transform hover:scale-105"
                                >
                                    INIZIA TEST
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'QUIZ' && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            {/* Progress Bar */}
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex + 1) / lesson.questions.length) * 100}% ` }}
                                />
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <span className="text-xs text-slate-500 font-mono mb-2 block">DOMANDA {currentQuestionIndex + 1}/{lesson.questions.length}</span>
                                <h3 className="text-lg font-bold text-white mb-6">
                                    {lesson.questions[currentQuestionIndex].text}
                                </h3>

                                <div className="space-y-3">
                                    {lesson.questions[currentQuestionIndex].options.map((option, idx) => {
                                        let optionClass = "w-full p-4 rounded-lg border text-left transition-all ";

                                        if (isAnswerChecked) {
                                            if (idx === lesson.questions[currentQuestionIndex].correctAnswer) {
                                                optionClass += "bg-emerald-950/50 border-emerald-500/50 text-emerald-400";
                                            } else if (idx === selectedOption) {
                                                optionClass += "bg-red-950/50 border-red-500/50 text-red-400";
                                            } else {
                                                optionClass += "bg-slate-900/50 border-slate-800 text-slate-500 opacity-50";
                                            }
                                        } else {
                                            if (idx === selectedOption) {
                                                optionClass += "bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]";
                                            } else {
                                                optionClass += "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800";
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(idx)}
                                                disabled={isAnswerChecked}
                                                className={optionClass}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{option}</span>
                                                    {isAnswerChecked && idx === lesson.questions[currentQuestionIndex].correctAnswer && (
                                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                                    )}
                                                    {isAnswerChecked && idx === selectedOption && idx !== lesson.questions[currentQuestionIndex].correctAnswer && (
                                                        <XCircle className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Explanation & Next Button */}
                            <AnimatePresence>
                                {isAnswerChecked && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                                            <div className="flex items-start gap-3">
                                                <Brain className="w-5 h-5 text-cyan-400 mt-1" />
                                                <div>
                                                    <span className="text-xs font-bold text-cyan-400 uppercase block mb-1">Analisi Tattica</span>
                                                    <p className="text-sm text-slate-300 leading-relaxed">
                                                        {lesson.questions[currentQuestionIndex].explanation}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleNextQuestion}
                                            className="w-full py-4 rounded-lg bg-white text-black font-bold font-orbitron tracking-wider hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {currentQuestionIndex < lesson.questions.length - 1 ? 'PROSSIMA DOMANDA' : 'COMPLETA MISSIONE'}
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!isAnswerChecked && (
                                <button
                                    onClick={handleCheckAnswer}
                                    disabled={selectedOption === null}
                                    className={`w-full py-4 rounded-lg font-bold font-orbitron tracking-wider transition-all ${selectedOption !== null
                                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    CONFERMA RISPOSTA
                                </button>
                            )}
                        </motion.div>
                    )}

                    {mode === 'COMPLETE' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8 pt-12"
                        >
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-cyan-500 blur-[60px] opacity-20 rounded-full" />
                                <TrophyIcon score={score} total={lesson.questions.length} />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-orbitron font-bold text-white">MISSIONE COMPIUTA</h2>
                                <p className="text-slate-400">Hai completato il modulo di addestramento.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <span className="text-xs text-slate-500 uppercase block mb-1">Punteggio</span>
                                    <span className="text-2xl font-bold text-cyan-400">{score}/{lesson.questions.length}</span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <span className="text-xs text-slate-500 uppercase block mb-1">XP Guadagnati</span>
                                    <span className="text-2xl font-bold text-amber-400">+{lesson.xpReward}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleExit}
                                className="px-12 py-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold font-orbitron tracking-wider shadow-lg hover:shadow-cyan-500/25 transition-all w-full max-w-xs"
                            >
                                TORNA ALLA MAPPA
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function TrophyIcon({ score, total }: { score: number, total: number }) {
    const percentage = (score / total) * 100;

    return (
        <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="#0891b2"
                    strokeWidth="8"
                    strokeDasharray={`${percentage * 2.89} 289`}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_10px_rgba(8,145,178,0.5)]"
                />
            </svg>
            <div className="text-4xl font-bold text-white font-orbitron">
                {Math.round(percentage)}%
            </div>
        </div>
    );
}
