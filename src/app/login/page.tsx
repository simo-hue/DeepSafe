'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle, Shield, Mail, Lock, LogIn, UserPlus, ArrowRight, User } from 'lucide-react';

function LoginContent() {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    const validateForm = async () => {
        if (isSignUp) {
            if (!username || username.length < 3) {
                setLocalError('Lo username deve essere di almeno 3 caratteri.');
                return false;
            }
            // Check uniqueness
            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('username', username);

            if (error) {
                console.error('Error checking username:', error);
                setLocalError('Errore durante la verifica dello username.');
                return false;
            }

            if (count && count > 0) {
                setLocalError('Username già in uso. Scegline un altro.');
                return false;
            }
        }

        if (!email || !email.includes('@')) {
            setLocalError('Inserisci un indirizzo email valido.');
            return false;
        }
        if (!password || password.length < 6) {
            setLocalError('La password deve essere di almeno 6 caratteri.');
            return false;
        }
        return true;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        setSuccessMessage(null);

        if (!await validateForm()) return;

        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            username: username
                        }
                    },
                });
                if (error) throw error;
                setShowConfirmationModal(true);
                // setSuccessMessage('Controlla la tua email per confermare la registrazione!');
                // setIsSignUp(false); // Switch back to login view or keep showing success
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/'); // Redirect to dashboard
                router.refresh();
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setLocalError(err.message || 'Si è verificato un errore durante l\'autenticazione.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Login error:', error);
            setLoading(false);
            setLocalError(error.message);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0B0C10] font-sans selection:bg-cyan-500/30 p-4">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            {/* Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(69,162,158,0.08)_0%,transparent_70%)] pointer-events-none" />

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmationModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#121418] border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,211,238,0.2)] text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                                <Mail className="w-10 h-10 text-cyan-400" />
                            </div>

                            <h2 className="text-2xl font-bold text-white font-orbitron mb-4">CONTROLLA LA TUA EMAIL</h2>

                            <p className="text-slate-300 mb-8 leading-relaxed">
                                Abbiamo inviato un link di conferma a <span className="text-cyan-400 font-bold">{email}</span>.
                                <br />
                                Clicca sul link per attivare la tua identità e accedere al sistema.
                            </p>

                            <button
                                onClick={() => {
                                    setShowConfirmationModal(false);
                                    setIsSignUp(false);
                                }}
                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20"
                            >
                                HO CAPITO, TORNA AL LOGIN
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-[480px]"
            >
                <div className="relative bg-[#121418] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-black/50 overflow-hidden">

                    {/* Top Glow Accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-400/50 blur-[2px]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-cyan-400/10 blur-3xl rounded-full" />

                    {/* Header Section */}
                    <div className="flex flex-col items-center text-center mb-8 space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                            <div className="relative w-20 h-20 rounded-full border-2 border-white/10 bg-[#0B0C10] flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                <Shield className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-4xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 to-cyan-500 drop-shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                                DEEPSAFE
                            </h1>
                            <p className="text-cyan-500/80 font-mono text-xs tracking-[0.2em] uppercase">
                                &gt; {isSignUp ? 'Creazione Identità' : 'Inizializzazione Protocollo'}...
                            </p>
                        </div>
                    </div>

                    {/* Alerts */}
                    <AnimatePresence mode="wait">
                        {(error || localError) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-red-400 font-bold font-orbitron text-xs mb-1">ERRORE SISTEMA</h3>
                                    <p className="text-red-300/80 text-xs leading-relaxed">
                                        {localError || errorMessage || 'Autenticazione fallita.'}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/10 flex items-start gap-3"
                            >
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-green-400 font-bold font-orbitron text-xs mb-1">SUCCESSO</h3>
                                    <p className="text-green-300/80 text-xs leading-relaxed">
                                        {successMessage}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                        <div className="space-y-4">
                            {isSignUp && (
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Username Unico"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-[#1F2833] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-zinc-600 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all font-mono text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            )}
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email Agente"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#1F2833] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-zinc-600 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all font-mono text-sm"
                                    disabled={loading}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Codice Accesso (Password)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#1F2833] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-zinc-600 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all font-mono text-sm"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'REGISTRA IDENTITÀ' : 'ACCEDI AL SISTEMA'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center gap-4 mb-6">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-xs font-mono text-zinc-500 uppercase">Oppure</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full group relative h-14 rounded-xl bg-[#1F2833] border border-white/10 hover:border-cyan-400/50 transition-all duration-300 overflow-hidden flex items-center justify-center gap-3"
                    >
                        <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/5 transition-colors duration-300" />
                        <div className="bg-white p-1 rounded-full z-10">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                        <span className="text-zinc-300 font-bold font-orbitron tracking-wider text-xs group-hover:text-white transition-colors z-10">
                            ACCEDI CON GOOGLE
                        </span>
                    </button>

                    {/* Toggle Sign Up / Sign In */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setLocalError(null);
                                setSuccessMessage(null);
                            }}
                            className="text-xs font-mono text-cyan-500 hover:text-cyan-400 transition-colors tracking-wide"
                        >
                            {isSignUp ? (
                                <>HAI GIÀ UN ACCOUNT? <span className="underline decoration-cyan-500/50 underline-offset-4 font-bold">ACCEDI</span></>
                            ) : (
                                <>NUOVO AGENTE? <span className="underline decoration-cyan-500/50 underline-offset-4 font-bold">REGISTRATI</span></>
                            )}
                        </button>
                    </div>

                    {/* Footer Status */}
                    <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-[10px] text-cyan-500/70 font-mono tracking-widest uppercase">
                            <CheckCircle className="w-3 h-3" />
                            <span>Connessione Sicura: Stabilita</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
                <Loader2 className="w-8 h-8 animate-spin text-cyber-blue" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}