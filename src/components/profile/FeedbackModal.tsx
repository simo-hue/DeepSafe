import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bug, Lightbulb, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

type FeedbackType = 'bug' | 'feature' | 'like' | 'dislike';

export function FeedbackModal({ isOpen, onClose, userId }: FeedbackModalProps) {
    const [type, setType] = useState<FeedbackType>('bug');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('feedback').insert({
                user_id: userId,
                type,
                message,
                device_info: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language
                }
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setMessage('');
                setType('bug');
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error sending feedback:', error);
            alert('Errore durante l\'invio del feedback. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (t: FeedbackType) => {
        switch (t) {
            case 'bug': return <Bug className="w-5 h-5" />;
            case 'feature': return <Lightbulb className="w-5 h-5" />;
            case 'like': return <ThumbsUp className="w-5 h-5" />;
            case 'dislike': return <ThumbsDown className="w-5 h-5" />;
        }
    };

    const getTypeLabel = (t: FeedbackType) => {
        switch (t) {
            case 'bug': return 'Segnala Bug';
            case 'feature': return 'Nuova Idea';
            case 'like': return 'Mi Piace';
            case 'dislike': return 'Non Mi Piace';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-slate-900 border border-cyan-500/30 rounded-xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold font-orbitron text-white flex items-center gap-2">
                                <span className="text-cyan-400">FEEDBACK</span> TERMINAL
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {success ? (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-green-400 animate-in fade-in zoom-in">
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                        <Send className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold font-orbitron text-lg text-center">FEEDBACK INVIATO</p>
                                    <p className="text-xs font-mono text-slate-400">Grazie per il tuo contributo, Agente.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Type Selection */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['bug', 'feature', 'like', 'dislike'] as FeedbackType[]).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setType(t)}
                                                className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${type === t
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                                                    }`}
                                            >
                                                {getTypeIcon(t)}
                                                <span className="text-xs font-bold font-orbitron">{getTypeLabel(t)}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Message Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-slate-500 uppercase">Messaggio</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Descrivi il problema o la tua idea..."
                                            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none font-mono text-sm resize-none"
                                            maxLength={500}
                                        />
                                        <div className="text-right text-[10px] text-slate-600 font-mono">
                                            {message.length}/500
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !message.trim()}
                                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 font-orbitron tracking-wide"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        INVIA SEGNALAZIONE
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
