'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

interface AddFriendModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
}

export function AddFriendModal({ isOpen, onClose, currentUserId }: AddFriendModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .ilike('username', `%${searchQuery}%`)
                .neq('id', currentUserId)
                .limit(5);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (err) {
            console.error('Error searching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (friendId: string) => {
        try {
            const { error } = await supabase
                .from('friends')
                .insert({ user_id: currentUserId, friend_id: friendId });

            if (error) throw error;

            setSentRequests(prev => new Set(prev).add(friendId));
        } catch (err) {
            console.error('Error sending request:', err);
            // Handle duplicate key error (already requested) gracefully if needed
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-cyber-dark border border-cyber-blue/30 rounded-xl w-full max-w-md overflow-hidden shadow-[0_0_30px_rgba(69,162,158,0.2)]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                        <h3 className="text-lg font-bold font-orbitron text-white tracking-wide">AGGIUNGI AGENTE</h3>
                        <button onClick={onClose} className="text-zinc-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Cerca username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-cyber-blue/50 focus:outline-none transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50 px-4 py-2 rounded-lg font-bold text-sm hover:bg-cyber-blue/30 transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CERCA'}
                            </button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-cyber-gray/30 flex items-center justify-center text-xs font-bold font-mono">
                                            {user.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-zinc-200">{user.username}</span>
                                    </div>
                                    <button
                                        onClick={() => sendRequest(user.id)}
                                        disabled={sentRequests.has(user.id)}
                                        className={`p-2 rounded-lg transition-colors ${sentRequests.has(user.id)
                                                ? 'bg-green-500/20 text-green-500'
                                                : 'bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue/20'
                                            }`}
                                    >
                                        {sentRequests.has(user.id) ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                            {searchResults.length === 0 && searchQuery && !loading && (
                                <div className="text-center text-zinc-500 text-sm py-4">
                                    Nessun agente trovato.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
