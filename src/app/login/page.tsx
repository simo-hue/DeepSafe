'use client';

// CONFIGURATION CHECKLIST:
// 1. Enable Google Provider in Authentication > Providers in Supabase Dashboard.
// 2. Add http://localhost:3000/auth/callback to 'Redirect URLs' in Supabase Authentication > URL Configuration.
// 3. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { ChevronRight, Shield, Users, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Initialize client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const SLIDES = [
    {
        id: 1,
        title: "Don't get scammed by AI.",
        description: "Learn to spot Deepfakes and phishing in minutes.",
        icon: <Shield className="w-24 h-24 text-cyber-blue animate-pulse-slow" />,
        color: "bg-cyber-blue/10"
    },
    {
        id: 2,
        title: "Challenge your friends.",
        description: "Prove who knows more about digital safety.",
        icon: <Users className="w-24 h-24 text-cyber-purple animate-pulse-slow" />,
        color: "bg-cyber-purple/10"
    },
    {
        id: 3,
        title: "Learn in 5 minutes a day.",
        description: "Short, fun quizzes that fit your schedule.",
        icon: <Zap className="w-24 h-24 text-yellow-500 animate-pulse-slow" />,
        color: "bg-yellow-500/10"
    }
];

export default function LoginPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (provider: 'google' | 'email') => {
        setLoading(true);
        try {
            if (provider === 'google') {
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
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                alert('Check your email for the magic link!');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            alert(error.message || 'Error logging in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-cyber-dark text-white">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(69,162,158,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(69,162,158,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Carousel Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 relative overflow-hidden z-10">
                <div className={cn(
                    "w-full max-w-xs aspect-square rounded-full flex items-center justify-center mb-4 transition-colors duration-500 backdrop-blur-sm border border-white/5",
                    SLIDES[currentSlide].color
                )}>
                    {SLIDES[currentSlide].icon}
                </div>

                <div className="space-y-2 max-w-xs mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentSlide}>
                    <h1 className="text-3xl font-bold tracking-tight font-orbitron text-glow">{SLIDES[currentSlide].title}</h1>
                    <p className="text-zinc-400 text-lg">{SLIDES[currentSlide].description}</p>
                </div>

                {/* Dots */}
                <div className="flex space-x-2">
                    {SLIDES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                idx === currentSlide ? "w-8 bg-cyber-blue shadow-[0_0_8px_#45A29E]" : "bg-cyber-gray"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Login Section */}
            <div className="p-6 pb-10 bg-cyber-dark/80 backdrop-blur-md border-t border-cyber-blue/20 space-y-6 z-10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">

                {/* Holo-Button for Google */}
                <button
                    onClick={() => handleLogin('google')}
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 relative group overflow-hidden border border-cyber-blue/50 bg-cyber-dark hover:bg-cyber-blue/10 hover:shadow-[0_0_20px_rgba(69,162,158,0.4)] hover:border-cyber-blue"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin text-cyber-blue" />
                            <span className="text-cyber-blue font-mono tracking-widest">CONNECTING...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 text-white group-hover:text-cyber-blue transition-colors" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-white group-hover:text-cyber-blue transition-colors font-orbitron tracking-wide">INITIATE GOOGLE LINK</span>
                        </>
                    )}
                    {/* Scan line effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-blue/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-cyber-gray/30" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-mono tracking-widest">
                        <span className="bg-cyber-dark px-2 text-cyber-gray">Or via Encrypted Email</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="email"
                        placeholder="agent@deepsafe.io"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-cyber-gray/50 bg-cyber-dark/50 text-white font-mono placeholder:text-cyber-gray/50 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_rgba(69,162,158,0.3)] transition-all"
                    />
                    <button
                        onClick={() => handleLogin('email')}
                        disabled={loading || !email}
                        className="px-6 py-3 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue font-bold rounded-xl hover:bg-cyber-blue hover:text-cyber-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
