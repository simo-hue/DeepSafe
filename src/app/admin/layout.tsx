'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check session storage on mount
        const unlocked = sessionStorage.getItem('admin_unlocked');
        if (unlocked === 'true') {
            setIsUnlocked(true);
        }
        setIsLoading(false);
    }, []);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded for demo/simplicity as requested ("prevent the log in")
        // In production, this should be validated against an env var or server-side
        if (password === 'admin123') {
            sessionStorage.setItem('admin_unlocked', 'true');
            setIsUnlocked(true);
            setError(false);
        } else {
            setError(true);
            setPassword('');
        }
    };

    const handleExit = () => {
        router.push('/');
    };

    if (isLoading) return null;

    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-cyan-900/20">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                            <Shield className="w-8 h-8 text-cyan-500" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-white text-center font-orbitron mb-2">RESTRICTED ACCESS</h1>
                    <p className="text-slate-400 text-center text-sm mb-8 font-mono">
                        This area is protected. Authorized personnel only.
                    </p>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(false);
                                    }}
                                    placeholder="Enter Access Code"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono"
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-xs mt-2 font-mono text-center">
                                    ACCESS DENIED: Invalid credentials.
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 group"
                        >
                            AUTHENTICATE
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleExit}
                            className="text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors"
                        >
                            ← RETURN TO APPLICATION
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
