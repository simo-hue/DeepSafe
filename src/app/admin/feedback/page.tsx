'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Bug, Lightbulb, ThumbsUp, ThumbsDown, Trash2, CheckCircle, Archive, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Feedback {
    id: string;
    user_id: string;
    type: 'bug' | 'feature' | 'like' | 'dislike';
    message: string;
    status: 'new' | 'read' | 'archived';
    created_at: string;
    device_info: any;
    profiles: {
        username: string | null;
    } | null;
}

export default function AdminFeedbackPage() {
    const router = useRouter();
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'bug' | 'feature' | 'like' | 'dislike'>('all');

    const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select(`
                    *,
                    profiles:user_id (username)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Cast data to match Feedback interface since Supabase types might be slightly different for joins
            setFeedback((data as any) || []);
        } catch (error: any) {
            console.error('Error fetching feedback:', JSON.stringify(error, null, 2));
            alert(`Error fetching feedback: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: 'new' | 'read' | 'archived') => {
        try {
            const { error } = await supabase
                .from('feedback')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setFeedback(prev => prev.map(item =>
                item.id === id ? { ...item, status: status as any } : item
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;

        try {
            const { error } = await supabase
                .from('feedback')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setFeedback(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting feedback:', error);
        }
    };

    const filteredFeedback = feedback.filter(item => {
        if (filter !== 'all' && item.status !== filter) return false;
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;
        return true;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bug': return <Bug className="w-4 h-4 text-red-400" />;
            case 'feature': return <Lightbulb className="w-4 h-4 text-yellow-400" />;
            case 'like': return <ThumbsUp className="w-4 h-4 text-green-400" />;
            case 'dislike': return <ThumbsDown className="w-4 h-4 text-orange-400" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'read': return 'bg-slate-700/50 text-slate-400 border-slate-600';
            case 'archived': return 'bg-slate-800/30 text-slate-500 border-slate-700';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin')}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wider flex items-center gap-3">
                            <Shield className="w-8 h-8 text-cyan-500" />
                            FEEDBACK CENTER
                        </h1>
                        <p className="text-slate-500 font-mono text-sm">USER REPORTS & SUGGESTIONS</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <Filter className="w-4 h-4 text-slate-500 ml-2" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-transparent text-sm text-slate-300 focus:outline-none p-1"
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="bg-transparent text-sm text-slate-300 focus:outline-none p-1"
                        >
                            <option value="all">All Types</option>
                            <option value="bug">Bugs</option>
                            <option value="feature">Ideas</option>
                            <option value="like">Likes</option>
                            <option value="dislike">Dislikes</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredFeedback.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`bg-slate-900/50 border rounded-xl p-6 transition-all ${item.status === 'new' ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-slate-800'
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 border ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                <span>{item.profiles?.username || 'Unknown User'}</span>
                                                <span>•</span>
                                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                                                {getTypeIcon(item.type)}
                                                <span className="uppercase">{item.type}</span>
                                            </span>
                                        </div>
                                        <p className="text-slate-200 text-lg mb-4 font-light leading-relaxed">
                                            {item.message}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                                            <span className="text-cyan-600">
                                                USER: {item.profiles?.username || 'Unknown'}
                                            </span>
                                            {item.device_info?.platform && (
                                                <span>OS: {item.device_info.platform}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {item.status === 'new' && (
                                            <button
                                                onClick={() => updateStatus(item.id, 'read')}
                                                className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400 transition-colors"
                                                title="Mark as Read"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                        {item.status !== 'archived' && (
                                            <button
                                                onClick={() => updateStatus(item.id, 'archived')}
                                                className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-yellow-400 transition-colors"
                                                title="Archive"
                                            >
                                                <Archive className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredFeedback.length === 0 && (
                        <div className="text-center py-20 text-slate-500 font-mono">
                            NO FEEDBACK FOUND
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
