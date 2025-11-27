'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, AlertTriangle } from 'lucide-react';
import { Quiz } from '@/lib/mockData';
import { useUserStore } from '@/store/useUserStore';
import { calculateRewards } from '@/lib/gamification';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { VisualQuizCard } from '@/components/gamification/VisualQuizCard';
import { QuizActionPanel } from '@/components/gamification/QuizActionPanel';
import { SystemFailureModal } from '@/components/gamification/SystemFailureModal';
import { motion, AnimatePresence } from 'framer-motion';
import posthog from 'posthog-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

import { submitDuelScore } from '@/lib/challenges';
import { useSearchParams } from 'next/navigation';

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const challengeId = searchParams.get('challengeId');
    const { lives, decrementLives, incrementStreak } = useUserStore();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [showShopModal, setShowShopModal] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [earnedXp, setEarnedXp] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                setLoading(true);
                // 1. Fetch Level Info
                const { data: levelData, error: levelError } = await supabase
                    .from('levels')
                    .select('*')
                    .eq('id', params.id as string)
                    .single();

                if (levelError) throw levelError;

                // 2. Fetch Questions
                const { data: questionsData, error: questionsError } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('level_id', params.id as string);

                if (questionsError) throw questionsError;

                // 3. Construct Quiz Object
                const fetchedQuiz: Quiz = {
                    id: levelData.id,
                    title: levelData.title,
                    description: 'Missione attiva', // Could fetch from modules if needed
                    xpReward: levelData.xp_reward,
                    completed: false,
                    locked: false,
                    questions: questionsData.map((q: any) => ({
                        id: q.id,
                        type: q.type,
                        text: q.text,
                        imageUrl: q.image_url,
                        hotspots: q.hotspots,
                        options: q.options,
                        correctAnswer: q.correct_index,
                        explanation: q.explanation || ''
                    }))
                };

                setQuiz(fetchedQuiz);
            } catch (error) {
                console.error('Error fetching quiz:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            checkAuthAndFetch();
        }
    }, [params.id, router]);

    if (!quiz) return <div className="p-4 text-cyber-blue animate-pulse">Inizializzazione Sistema...</div>;

    // Shop Modal
    if (showShopModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="glass-panel p-6 rounded-2xl max-w-sm w-full text-center space-y-4 animate-in zoom-in duration-200 border-cyber-red/50">
                    <div className="w-16 h-16 bg-cyber-red/20 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
                        💔
                    </div>
                    <h2 className="text-xl font-bold font-orbitron text-cyber-red text-glow-danger">Errore di Sistema</h2>
                    <p className="text-zinc-400">Esaurimento risorse critiche. Ricarica richiesta.</p>
                    <div className="flex flex-col gap-2">
                        <Link href="/shop" className="w-full py-3 bg-cyber-blue text-cyber-dark rounded-xl font-bold hover:bg-cyber-green transition-colors">
                            Accedi al Deposito
                        </Link>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 text-zinc-500 font-bold hover:text-white"
                        >
                            Annulla Missione
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ... inside component ...

    if (lives <= 0 && !showShopModal) {
        return (
            <SystemFailureModal
                onRefill={() => {
                    // Demo: Refill lives immediately
                    const { refillLives } = useUserStore.getState();
                    refillLives();
                    alert("RICARICA EMERGENZA RIUSCITA! -0.99€ (Demo)");
                }}
                onPremium={() => {
                    // Demo: Activate premium
                    const { setInfiniteLives } = useUserStore.getState();
                    setInfiniteLives(true);
                    alert("POTERE ILLIMITATO ACQUISITO! -4.99€ (Demo)");
                }}
            />
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    // Safety check: if no questions or invalid index, show error
    if (!currentQuestion) {
        return (
            <div className="p-8 text-center space-y-4">
                <AlertTriangle className="w-16 h-16 text-cyber-red mx-auto" />
                <h2 className="text-xl font-bold text-cyber-red">Errore Sistema</h2>
                <p className="text-cyber-gray">Nessuna domanda disponibile per questo livello.</p>
                <Link
                    href="/dashboard"
                    className="inline-block px-6 py-3 bg-cyber-blue text-cyber-dark rounded-xl font-bold hover:bg-cyber-green transition-colors"
                >
                    Torna alla Dashboard
                </Link>
            </div>
        );
    }

    const handleAnswer = async (optionIndex: number) => {
        if (selectedOption !== null) return; // Prevent multiple clicks
        setSelectedOption(optionIndex);

        const currentQ = quiz.questions[currentQuestionIndex];
        const isCorrectAnswer = optionIndex === currentQ.correctAnswer;

        setIsCorrect(isCorrectAnswer);
        setIsAnswered(true);

        // ... imports

        // ... inside handleAnswer

        if (isCorrectAnswer) {
            setScore(score + 1);
        } else {
            decrementLives();

            // Sync with backend if logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase.rpc('decrement_hearts');
                if (error) console.error('❌ Error decrementing hearts:', JSON.stringify(error, null, 2));
            }

            if (lives <= 1) {
                posthog.capture('quiz_failed', {
                    quiz_id: params.id,
                    question_index: currentQuestionIndex
                });
                setShowShopModal(true);
            }
        }
    };

    const handleNext = async () => {
        if (isLastQuestion) {
            if (isCorrect || isAnswered) {
                const finalScore = score + (isCorrect ? 1 : 0);
                const totalQuestions = quiz.questions.length;
                const calculatedXp = Math.round((finalScore / totalQuestions) * quiz.xpReward);

                setEarnedXp(calculatedXp);
                // addXp removed - handled by complete_level RPC
                incrementStreak();
                setShowReward(true);

                // Call the complete_level RPC
                try {
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {
                        // -- DUEL MODE LOGIC --
                        // If this quiz was played as part of a challenge, submit the score to the challenges table.
                        if (mode === 'duel' && challengeId) {
                            // We don't await this to prevent blocking the UI transition,
                            // but we log success/failure.
                            submitDuelScore(challengeId, user.id, finalScore)
                                .then(() => console.log('⚔️ Duel score submitted successfully.'))
                                .catch(err => console.error('❌ Error submitting duel score:', err));

                            // Track the duel completion event for analytics
                            posthog.capture('duel_completed', {
                                challenge_id: challengeId,
                                score: finalScore,
                                // A simple heuristic for 'won'. The actual winner is determined by the DB logic
                                // comparing scores from both participants.
                                won: finalScore > (totalQuestions / 2),
                                quiz_id: params.id,
                                user_id: user.id
                            });
                        }

                        // Track Quiz Completion
                        posthog.capture('quiz_completed', {
                            quiz_id: params.id,
                            score: finalScore,
                            xp_earned: calculatedXp,
                            perfect_score: finalScore === totalQuestions,
                            mode: mode || 'solo'
                        });

                        // Call the robust RPC
                        const { data, error } = await supabase.rpc('complete_level', {
                            p_user_id: user.id,
                            p_level_id: params.id as string,
                            p_score: finalScore,
                            p_earned_xp: calculatedXp // Pass proportional XP
                        });

                        // Type assertion for RPC response
                        const rpcResult = data as { success?: boolean; error?: string } | null;

                        if (error || (rpcResult && !rpcResult.success)) {
                            console.error('❌ Error completing level (RPC):', error || rpcResult?.error);
                            // Fallback: Insert directly into user_progress (Partial fix if RPC fails)
                            await supabase.from('user_progress').upsert({
                                user_id: user.id,
                                quiz_id: params.id as string,
                                score: finalScore,
                                status: 'completed',
                                completed_at: new Date().toISOString()
                            }, { onConflict: 'user_id, quiz_id' });

                            // Note: XP should be handled by complete_level RPC
                            // If that fails, we rely on the profile refresh to show accurate XP
                            console.warn('complete_level RPC failed, XP may not be updated correctly');
                        } else {
                            console.log('✅ Level completed successfully:', data);
                        }
                    }

                    // 2. CRITICAL: Force refresh the user profile to get new XP
                    try {
                        console.log('🔄 Refreshing profile...');
                        await useUserStore.getState().refreshProfile();
                        console.log('✅ Profile refreshed');
                    } catch (refreshError) {
                        console.error('❌ Error refreshing profile:', refreshError);
                        alert('Errore aggiornamento profilo (vedi console)');
                    }

                    // 3. Background Refresh (No auto-redirect)
                    console.log('✅ Profile refreshed, waiting for user input...');

                } catch (error) {
                    console.error('❌ Unexpected error completing level:', error);
                    // Don't redirect on error, let user click the button
                }
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
                    <h2 className="text-3xl font-bold text-cyber-purple font-orbitron text-glow">Missione Compiuta</h2>
                    <p className="text-xl font-medium text-cyber-blue">Dati Messi in Sicurezza: +{earnedXp} XP</p>
                </div>
                <button
                    onClick={() => {
                        // Force Hard Refresh to ensure Dashboard gets fresh data
                        window.location.href = '/dashboard';
                    }}
                    className="px-8 py-3 bg-cyber-blue text-cyber-dark rounded-full font-bold text-lg shadow-[0_0_15px_rgba(69,162,158,0.5)] hover:bg-cyber-green transition-all hover:scale-105"
                >
                    Ritorna alla Base
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative min-h-screen pb-80"> {/* Increased padding for larger Action Panel */}
            {/* HUD Header */}
            {/* HUD Header */}
            <div className="flex items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden z-10">
                <Link href="/" className="p-3 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20 group shrink-0">
                    <ArrowLeft className="w-5 h-5 text-cyber-blue group-hover:text-white transition-colors" />
                </Link>

                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-end px-1">
                        <span className="text-[10px] font-bold tracking-widest text-cyber-gray uppercase">Sincronizzazione Sistema</span>
                        <span className="text-sm font-bold font-orbitron text-cyber-blue text-glow">
                            {currentQuestionIndex + 1} <span className="text-cyber-gray text-xs">/ {quiz.questions.length}</span>
                        </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_10px)]" />

                        {/* Fill */}
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyber-blue to-cyber-purple shadow-[0_0_15px_rgba(69,162,158,0.6)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                        >
                            {/* Leading Edge Shine */}
                            <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/80 shadow-[0_0_10px_white]" />
                        </motion.div>
                    </div>
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
                                        stateStyles = "border-cyber-green bg-cyber-green/20 text-cyber-green shadow-[0_0_15px_rgba(102,252,241,0.2)]";
                                        icon = <Check className="w-5 h-5" />;
                                    } else if (index === selectedOption) {
                                        stateStyles = "border-cyber-red bg-cyber-red/20 text-cyber-red animate-glitch";
                                        icon = <X className="w-5 h-5" />;
                                    } else {
                                        stateStyles = "opacity-30 grayscale border-transparent";
                                    }
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        disabled={isAnswered}
                                        className={cn(
                                            "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-center justify-between group glass-card relative overflow-hidden",
                                            stateStyles
                                        )}
                                    >
                                        <span className="font-medium relative z-10">{option}</span>
                                        {icon}
                                        {/* Hover Effect for Unanswered */}
                                        {!isAnswered && (
                                            <div className="absolute inset-0 bg-cyber-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Action Panel */}
            <AnimatePresence>
                {isAnswered && (
                    <QuizActionPanel
                        isCorrect={isCorrect}
                        correctAnswerText={currentQuestion.options[currentQuestion.correctAnswer]}
                        explanation={currentQuestion.explanation}
                        onNext={handleNext}
                        isLastQuestion={isLastQuestion}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
