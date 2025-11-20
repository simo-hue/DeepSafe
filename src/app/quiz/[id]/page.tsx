'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, AlertTriangle } from 'lucide-react';
import { MOCK_QUIZZES, Quiz } from '@/lib/mockData';
import { useUserStore } from '@/store/useUserStore';
import { calculateRewards } from '@/lib/gamification';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { VisualQuizCard } from '@/components/gamification/VisualQuizCard';
import { motion, AnimatePresence } from 'framer-motion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const { lives, decrementLives, addXp, incrementStreak } = useUserStore();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [showShopModal, setShowShopModal] = useState(false);
    const [showReward, setShowReward] = useState(false);

    useEffect(() => {
        const foundQuiz = MOCK_QUIZZES.find(q => q.id === params.id);
        if (foundQuiz) {
            setQuiz(foundQuiz);
        }
    }, [params.id]);

    if (!quiz) return <div className="p-4 text-cyber-blue animate-pulse">Initializing System...</div>;

    // Shop Modal
    if (showShopModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="glass-panel p-6 rounded-2xl max-w-sm w-full text-center space-y-4 animate-in zoom-in duration-200 border-cyber-red/50">
                    <div className="w-16 h-16 bg-cyber-red/20 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
                        💔
                    </div>
                    <h2 className="text-xl font-bold font-orbitron text-cyber-red text-glow-danger">System Failure</h2>
                    <p className="text-zinc-400">Critical resource depletion. Recharge required.</p>
                    <div className="flex flex-col gap-2">
                        <Link href="/shop" className="w-full py-3 bg-cyber-blue text-cyber-dark rounded-xl font-bold hover:bg-cyber-green transition-colors">
                            Access Supply Depot
                        </Link>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 text-zinc-500 font-bold hover:text-white"
                        >
                            Abort Mission
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (lives <= 0 && !showShopModal) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
            <h2 className="text-2xl font-bold text-cyber-red font-orbitron text-glow-danger">SIGNAL LOST</h2>
            <p className="text-zinc-400">Connection terminated. Lives depleted.</p>
            <Link href="/shop" className="px-6 py-2 bg-cyber-blue text-cyber-dark rounded-full font-bold hover:bg-cyber-green transition-colors">
                Recharge Signal
            </Link>
            <Link href="/" className="text-zinc-500 hover:text-white">Return to Base</Link>
        </div>
    );

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    const handleAnswer = async (optionIndex: number) => {
        if (selectedOption !== null) return; // Prevent multiple clicks
        setSelectedOption(optionIndex);

        const currentQ = quiz.questions[currentQuestionIndex];
        const isCorrectAnswer = optionIndex === currentQ.correctAnswer;

        setIsCorrect(isCorrectAnswer);
        setIsAnswered(true);

        if (isCorrectAnswer) {
            setScore(score + 1);
        } else {
            decrementLives();
            const { error } = await supabase.rpc('decrement_hearts');
            if (error) console.error('Error decrementing hearts:', error);

            if (lives <= 1) {
                setShowShopModal(true);
            }
        }
    };

    const handleNext = async () => {
        if (isLastQuestion) {
            if (isCorrect || isAnswered) {
                const { xp, badgeId } = calculateRewards(quiz, 0);
                addXp(xp);
                incrementStreak();
                setShowReward(true);

                const { error } = await supabase.from('user_progress').insert({
                    user_id: (await supabase.auth.getUser()).data.user?.id!,
                    quiz_id: params.id as string,
                    score: xp
                });
                if (error) console.error('Error saving progress:', error);
            }
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setIsCorrect(false);
        }
    };

    if (showReward) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-cyber-purple/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(176,38,255,0.5)] border border-cyber-purple">
                    <span className="text-4xl animate-bounce">🏆</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-cyber-purple font-orbitron text-glow">Mission Accomplished</h2>
                    <p className="text-xl font-medium text-cyber-blue">Data Secured: +{quiz.xpReward} XP</p>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="px-8 py-3 bg-cyber-blue text-cyber-dark rounded-full font-bold text-lg shadow-[0_0_15px_rgba(69,162,158,0.5)] hover:bg-cyber-green transition-all hover:scale-105"
                >
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative min-h-[80vh]">
            {/* HUD Header */}
            <div className="flex items-center justify-between glass-panel p-3 rounded-full">
                <Link href="/" className="p-2 hover:bg-cyber-gray/50 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-cyber-blue" />
                </Link>

                {/* Progress Bar - Laser Style */}
                <div className="flex-1 mx-4 h-1 bg-cyber-dark/50 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-cyber-blue shadow-[0_0_10px_#45A29E]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="text-xs font-mono text-cyber-blue">
                    {currentQuestionIndex + 1}/{quiz.questions.length}
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <h2 className="text-xl font-bold leading-snug font-orbitron text-white drop-shadow-md">
                        {currentQuestion.text}
                    </h2>

                    {currentQuestion.type === 'image_verification' ? (
                        <div className="relative overflow-hidden rounded-xl border border-cyber-blue/30 group">
                            {/* Scanning Animation Overlay */}
                            <div className="absolute inset-0 pointer-events-none z-20 animate-scan bg-gradient-to-b from-transparent via-cyber-blue/20 to-transparent h-[20%]" />

                            <VisualQuizCard
                                imageUrl={currentQuestion.imageUrl || ''}
                                correctAnswer={currentQuestion.correctAnswer}
                                hotspots={currentQuestion.hotspots}
                                onAnswer={handleAnswer}
                                disabled={isAnswered}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                let stateStyles = "border-cyber-gray/50 bg-cyber-dark/40 hover:border-cyber-blue/50 hover:bg-cyber-blue/10";
                                let icon = null;

                                if (isAnswered) {
                                    if (index === currentQuestion.correctAnswer) {
                                        stateStyles = "border-cyber-green bg-cyber-green/10 text-cyber-green shadow-[0_0_15px_rgba(102,252,241,0.2)]";
                                        icon = <Check className="w-5 h-5" />;
                                    } else if (index === selectedOption) {
                                        stateStyles = "border-cyber-red bg-cyber-red/10 text-cyber-red animate-glitch";
                                        icon = <AlertTriangle className="w-5 h-5" />;
                                    } else {
                                        stateStyles = "opacity-30 grayscale";
                                    }
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        disabled={isAnswered}
                                        className={cn(
                                            "w-full p-4 text-left rounded-xl border transition-all duration-200 flex items-center justify-between group glass-card",
                                            stateStyles
                                        )}
                                    >
                                        <span className="font-medium">{option}</span>
                                        {icon}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Feedback / Next Button */}
            <AnimatePresence>
                {isAnswered && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className={cn(
                            "fixed bottom-24 left-4 right-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl z-40",
                            isCorrect
                                ? "bg-cyber-green/10 border-cyber-green/50 shadow-[0_0_30px_rgba(102,252,241,0.15)]"
                                : "bg-cyber-red/10 border-cyber-red/50 shadow-[0_0_30px_rgba(255,0,85,0.15)]"
                        )}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className={cn(
                                    "font-bold text-lg font-orbitron",
                                    isCorrect ? "text-cyber-green text-glow" : "text-cyber-red text-glow-danger"
                                )}>
                                    {isCorrect ? "SYSTEM SECURE" : "SECURITY BREACH"}
                                </p>
                                {!isCorrect && (
                                    <div className="mt-2 text-sm text-zinc-300">
                                        <p className="font-bold text-cyber-red mb-1">Correct Protocol: {currentQuestion.options[currentQuestion.correctAnswer]}</p>
                                        <p className="italic opacity-80 text-xs">{currentQuestion.explanation}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleNext}
                                className={cn(
                                    "px-6 py-3 rounded-xl font-bold text-cyber-dark shadow-lg transition-transform active:scale-95 whitespace-nowrap",
                                    isCorrect
                                        ? "bg-cyber-green hover:bg-white hover:shadow-[0_0_20px_#66FCF1]"
                                        : "bg-cyber-red hover:bg-white hover:shadow-[0_0_20px_#FF0055]"
                                )}
                            >
                                {isLastQuestion ? "Complete" : "Next >"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
