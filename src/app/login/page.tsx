'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { ChevronRight, Shield, Users, Zap } from 'lucide-react';
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
        icon: <Shield className="w-24 h-24 text-blue-500" />,
        color: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
        id: 2,
        title: "Challenge your friends.",
        description: "Prove who knows more about digital safety.",
        icon: <Users className="w-24 h-24 text-purple-500" />,
        color: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
        id: 3,
        title: "Learn in 5 minutes a day.",
        description: "Short, fun quizzes that fit your schedule.",
        icon: <Zap className="w-24 h-24 text-yellow-500" />,
        color: "bg-yellow-50 dark:bg-yellow-900/20"
    }
];

export default function LoginPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    };

    const handleLogin = async (provider: 'google' | 'email') => {
        setLoading(true);
        try {
            if (provider === 'google') {
                await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
            } else {
                await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                alert('Check your email for the magic link!');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Error logging in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
            {/* Carousel Section */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 relative overflow-hidden">
                <div className={cn(
                    "w-full max-w-xs aspect-square rounded-full flex items-center justify-center mb-4 transition-colors duration-500",
                    SLIDES[currentSlide].color
                )}>
                    {SLIDES[currentSlide].icon}
                </div>

                <div className="space-y-2 max-w-xs mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentSlide}>
                    <h1 className="text-3xl font-bold tracking-tight">{SLIDES[currentSlide].title}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">{SLIDES[currentSlide].description}</p>
                </div>

                {/* Dots */}
                <div className="flex space-x-2">
                    {SLIDES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                idx === currentSlide ? "w-8 bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Login Section */}
            <div className="p-6 pb-10 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
                <button
                    onClick={() => handleLogin('google')}
                    disabled={loading}
                    className="w-full py-3.5 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500">Or with email</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => handleLogin('email')}
                        disabled={loading || !email}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
