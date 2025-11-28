'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Terminal, Save, RefreshCw, Server, Database, Lock, ArrowLeft } from 'lucide-react';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';

export default function DevPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'info' | 'danger' | 'warning' | 'success';
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'root') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Access Denied: Invalid credentials');
            setPassword('');
        }
    };

    const closeConfirmation = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const askConfirmation = (
        title: string,
        message: string,
        onConfirm: () => void,
        variant: 'info' | 'danger' | 'warning' | 'success' = 'info',
        confirmText = 'Conferma'
    ) => {
        setConfirmationModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                closeConfirmation();
            },
            variant,
            confirmText
        });
    };

    // --- System Maintenance Logic (Moved from AdminPage) ---
    const handleBackup = async () => {
        try {
            const response = await fetch('/api/admin/backup');
            if (!response.ok) throw new Error('Backup failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `deepsafe-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Backup error:', error);
            alert('Backup failed. Check console for details.');
        }
    };

    const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        askConfirmation(
            'RIPRISTINO DATABASE',
            'ATTENZIONE: Questa azione SOVRASCRIVERÀ l\'intero database con i dati del backup. Tutti i dati attuali andranno persi. Sei sicuro?',
            () => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const json = JSON.parse(e.target?.result as string);
                        const response = await fetch('/api/admin/restore', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ data: json.data || json })
                        });

                        const result = await response.json();
                        if (!response.ok) throw new Error(result.error || 'Restore failed');

                        alert('Restore successful! The page will now reload.');
                        window.location.reload();
                    } catch (error: any) {
                        console.error('Restore error:', error);
                        alert(`Restore failed: ${error.message}`);
                    }
                };
                reader.readAsText(file);
            },
            'danger',
            'RIPRISTINA ORA'
        );

        event.target.value = '';
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                            <Lock className="w-8 h-8 text-cyan-500" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white text-center font-orbitron mb-2">DEV CONSOLE</h1>
                    <p className="text-slate-500 text-center font-mono text-sm mb-8">RESTRICTED ACCESS AREA</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter root password..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-red-400 text-xs font-mono text-center">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors font-orbitron"
                        >
                            AUTHENTICATE
                        </button>
                    </form>
                    <button
                        onClick={() => router.back()}
                        className="w-full mt-4 text-slate-500 hover:text-slate-300 text-xs font-mono flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        RETURN TO SAFETY
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <Terminal className="w-10 h-10 text-green-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wider">DEV CONSOLE</h1>
                        <p className="text-slate-500 font-mono text-sm">ADVANCED SYSTEM CONTROLS</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 text-slate-400 font-mono text-xs transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO ADMIN
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Maintenance Section */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white font-orbitron mb-6 flex items-center gap-2">
                        <Save className="w-5 h-5 text-cyan-500" />
                        SYSTEM MAINTENANCE
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                            <h3 className="text-sm font-bold text-slate-300 mb-2 font-mono">DATABASE BACKUP</h3>
                            <p className="text-xs text-slate-500 mb-4">Download a complete JSON dump of the current database state.</p>
                            <button
                                onClick={handleBackup}
                                className="w-full px-4 py-3 bg-blue-900/20 border border-blue-700/50 rounded hover:bg-blue-900/40 text-blue-400 font-mono text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                DOWNLOAD BACKUP (.JSON)
                            </button>
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                            <h3 className="text-sm font-bold text-slate-300 mb-2 font-mono">DATABASE RESTORE</h3>
                            <p className="text-xs text-slate-500 mb-4">Overwrite the current database with a previous backup file.</p>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleRestore}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <button
                                    className="w-full px-4 py-3 bg-red-900/20 border border-red-700/50 rounded hover:bg-red-900/40 text-red-400 font-mono text-sm transition-colors flex items-center justify-center gap-2 pointer-events-none"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    RESTORE FROM BACKUP
                                </button>
                            </div>
                            <p className="text-[10px] text-red-500/70 mt-2 font-mono text-center">
                                * WARNING: IRREVERSIBLE ACTION
                            </p>
                        </div>
                    </div>
                </div>

                {/* Good to Know / Dev Info Section */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white font-orbitron mb-6 flex items-center gap-2">
                        <Server className="w-5 h-5 text-purple-500" />
                        ENVIRONMENT INFO
                    </h2>

                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-slate-800">
                            <span className="text-slate-500">Environment</span>
                            <span className="text-green-400">{process.env.NODE_ENV?.toUpperCase() || 'DEVELOPMENT'}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-slate-800">
                            <span className="text-slate-500">Supabase URL</span>
                            <span className="text-slate-300 truncate max-w-[200px]" title={process.env.NEXT_PUBLIC_SUPABASE_URL}>
                                {process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https:\/\/(.*?)\..*/, 'https://$1...')}
                            </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-slate-800">
                            <span className="text-slate-500">Platform</span>
                            <span className="text-slate-300">{navigator.platform}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-slate-800">
                            <span className="text-slate-500">User Agent</span>
                            <span className="text-slate-300 truncate max-w-[200px]" title={navigator.userAgent}>
                                {navigator.userAgent.split(')')[0] + ')'}
                            </span>
                        </div>

                        <div className="mt-8 p-4 bg-slate-800/30 rounded border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2 text-yellow-500">
                                <Database className="w-4 h-4" />
                                <span className="font-bold">Database Status</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-slate-300">Connected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={closeConfirmation}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                variant={confirmationModal.variant}
                confirmText={confirmationModal.confirmText}
            />
        </div>
    );
}
