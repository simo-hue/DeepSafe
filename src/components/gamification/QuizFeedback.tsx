import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizFeedbackProps {
    isCorrect: boolean;
    correctAnswerText: string;
    explanation: string;
    onNext: () => void;
    isLastQuestion: boolean;
}

export function QuizFeedback({
    isCorrect,
    correctAnswerText,
    explanation,
    onNext,
    isLastQuestion
}: QuizFeedbackProps) {
    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
                "fixed bottom-0 left-0 right-0 z-[200] rounded-t-3xl border-t-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden",
                isCorrect
                    ? "bg-cyber-dark border-cyber-green shadow-[0_-5px_20px_rgba(102,252,241,0.2)]"
                    : "bg-cyber-dark border-cyber-red shadow-[0_-5px_20px_rgba(255,0,85,0.2)]"
            )}
        >
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            <div className="relative p-6 pb-8 space-y-6">
                {/* Header Section */}
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg",
                        isCorrect
                            ? "bg-cyber-green/20 border-cyber-green text-cyber-green"
                            : "bg-cyber-red/20 border-cyber-red text-cyber-red"
                    )}>
                        {isCorrect ? <ShieldCheck className="w-6 h-6" /> : <X className="w-6 h-6" />}
                    </div>

                    <div>
                        <h2 className={cn(
                            "text-2xl font-bold font-orbitron tracking-wider",
                            isCorrect ? "text-cyber-green text-glow" : "text-cyber-red text-glow-danger"
                        )}>
                            {isCorrect ? "ACCESS GRANTED" : "THREAT DETECTED"}
                        </h2>
                        {isCorrect && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-mono text-cyber-blue font-bold"
                            >
                                +10 XP UPLOADED
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Lesson / Explanation */}
                <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                    {!isCorrect && (
                        <div className="flex items-start gap-2 text-cyber-red font-bold text-sm uppercase tracking-wide mb-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Correct Protocol: {correctAnswerText}</span>
                        </div>
                    )}
                    <p className="text-lg text-white leading-relaxed font-medium">
                        {explanation}
                    </p>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onNext}
                    className={cn(
                        "w-full py-4 rounded-xl font-bold font-orbitron text-lg tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg",
                        isCorrect
                            ? "bg-cyber-green text-black hover:bg-white hover:shadow-[0_0_20px_#66FCF1]"
                            : "bg-cyber-red text-white hover:bg-white hover:text-cyber-red hover:shadow-[0_0_20px_#FF0055]"
                    )}
                >
                    {isLastQuestion ? "COMPLETE MISSION" : "CONTINUE"} <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
