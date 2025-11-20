'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import { MOCK_QUIZZES, Quiz } from '@/lib/mockData';
import { useUserStore } from '@/store/useUserStore';
import { calculateRewards } from '@/lib/gamification';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { VisualQuizCard } from '@/components/gamification/VisualQuizCard';

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

    if (!quiz) return <div className="p-4">Loading...</div>;

    // Shop Modal
    if (showShopModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 animate-in zoom-in duration-200">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-2xl">
                        💔
                    </div>
                    <h2 className="text-xl font-bold">Out of Hearts!</h2>
                    <p className="text-zinc-500">You need hearts to keep learning. Refill them in the shop.</p>
                    <div className="flex flex-col gap-2">
                        <Link href="/shop" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">
                            Go to Shop
                        </Link>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 text-zinc-500 font-bold"
                        >
                            Quit Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (lives <= 0 && !showShopModal) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
            <h2 className="text-2xl font-bold text-red-500">Out of Lives!</h2>
            <p>Wait for them to refill or visit the shop.</p>
            <Link href="/shop" className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold">
                Go to Shop
            </Link>
            <Link href="/" className="text-zinc-500">Back to Home</Link>
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
            // Play success sound (not implemented)
        } else {
            // Wrong answer
            decrementLives();

            // Call RPC to decrement hearts in DB
            const { error } = await supabase.rpc('decrement_hearts');
            if (error) console.error('Error decrementing hearts:', error);

            if (lives <= 1) {
                setShowShopModal(true);
            }
        }
    };

    const handleNext = async () => {
        if (isLastQuestion) {
            // Finish Quiz
            if (isCorrect || isAnswered) {
                const { xp, badgeId } = calculateRewards(quiz, 0); // Simplified streak
                addXp(xp);
                incrementStreak();
                setShowReward(true);

                // If badge earned, we would show a toast/modal here
                if (badgeId) {
                    console.log(`Unlocked badge: ${badgeId}`);
                }

                // Save progress to DB
                const { error } = await supabase.from('user_progress').insert({
                    user_id: (await supabase.auth.getUser()).data.user?.id!,
                    quiz_id: params.id as string,
                    score: xp // Save actual XP earned
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
                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🏆</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-yellow-500">Quiz Complete!</h2>
                    <p className="text-xl font-medium">You earned +{quiz.xpReward} XP</p>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors"
                >
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="w-full max-w-[200px] h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mx-4">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Question */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold leading-snug">{currentQuestion.text}</h2>

                {currentQuestion.type === 'image_verification' ? (
                    <VisualQuizCard
                        imageUrl={currentQuestion.imageUrl || ''}
                        correctAnswer={currentQuestion.correctAnswer}
                        hotspots={currentQuestion.hotspots}
                        onAnswer={handleAnswer}
                        disabled={isAnswered}
                    />
                ) : (
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            let stateStyles = "border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-700";

                            if (isAnswered) {
                                if (index === currentQuestion.correctAnswer) {
                                    stateStyles = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
                                } else if (index === selectedOption) {
                                    stateStyles = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                                } else {
                                    stateStyles = "opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={isAnswered}
                                    className={cn(
                                        "w-full p-4 text-left rounded-xl border-2 font-medium transition-all",
                                        stateStyles
                                    )}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Feedback / Next Button */}
            {isAnswered && (
                <div className={cn(
                    "fixed bottom-0 left-0 right-0 p-4 pb-8 border-t animate-in slide-in-from-bottom duration-300",
                    isCorrect
                        ? "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-900"
                        : "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-900"
                )}>
                    <div className="max-w-md mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isCorrect ? "bg-green-500" : "bg-red-500"
                            )}>
                                {isCorrect ? <Check className="text-white" /> : <X className="text-white" />}
                            </div>
                            <div>
                                <p className={cn("font-bold text-lg", isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>
                                    {isCorrect ? "Correct!" : "Incorrect"}
                                </p>
                                {!isCorrect && (
                                    <div className="mt-1 text-sm text-red-600 dark:text-red-300">
                                        <p className="font-semibold">Correct Answer: {currentQuestion.options[currentQuestion.correctAnswer]}</p>
                                        <p className="mt-1 italic opacity-90">{currentQuestion.explanation}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className={cn(
                                "px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95",
                                isCorrect ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                            )}
                        >
                            {isLastQuestion ? "Finish" : "Next"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
