'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Globe, Users, Medal, Cpu, UserPlus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddFriendModal } from '@/components/leaderboard/AddFriendModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

interface LeaderboardEntry {
    id: string;
    username: string;
    avatar_url: string | null;
    xp: number;
    rank: number;
}

interface FriendRequest {
    id: string; // friendship id
    user_id: string; // sender id
    profile: {
        username: string;
        avatar_url: string | null;
    };
}

export default function LeaderboardPage() {
    const [user, setUser] = useState<any>(null);
    const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'friends'>('global');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
    const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchLeaderboard();
            if (leaderboardTab === 'friends') {
                fetchPendingRequests();
            }
        }
    }, [user, leaderboardTab]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            let data: any[] = [];

            if (leaderboardTab === 'global') {
                const { data: profiles, error } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, xp')
                    .order('xp', { ascending: false })
                    .limit(50);

                if (error) throw error;
                data = profiles || [];
            } else {
                // Friends Leaderboard
                // 1. Get accepted friendships
                const { data: friendships, error: friendsError } = await supabase
                    .from('friends')
                    .select('user_id, friend_id')
                    .eq('status', 'accepted')
                    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

                if (friendsError) throw friendsError;

                const friendIds = friendships?.map(f => f.user_id === user.id ? f.friend_id : f.user_id) || [];
                friendIds.push(user.id); // Include self

                // 2. Get profiles
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, xp')
                    .in('id', friendIds)
                    .order('xp', { ascending: false });

                if (profilesError) throw profilesError;
                data = profiles || [];
            }

            // Map to LeaderboardEntry with rank
            const formattedData: LeaderboardEntry[] = data.map((profile, index) => ({
                id: profile.id,
                username: profile.username || 'Agente Sconosciuto',
                avatar_url: profile.avatar_url,
                xp: profile.xp || 0,
                rank: index + 1
            }));

            setLeaderboardData(formattedData);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            // Fetch requests where current user is the friend_id (receiver) and status is pending
            const { data, error } = await supabase
                .from('friends')
                .select(`
                    id,
                    user_id,
                    profiles:user_id (username, avatar_url)
                `)
                .eq('friend_id', user.id)
                .eq('status', 'pending');

            if (error) throw error;

            // Transform data to match FriendRequest interface
            const requests = data?.map((item: any) => ({
                id: item.id,
                user_id: item.user_id,
                profile: item.profiles // Supabase returns single object for foreign key if 1:1 or N:1
            })) || [];

            setPendingRequests(requests);
        } catch (err) {
            console.error('Error fetching requests:', err);
        }
    };

    const handleAcceptRequest = async (friendshipId: string) => {
        try {
            const { error } = await supabase
                .from('friends')
                .update({ status: 'accepted' })
                .eq('id', friendshipId);

            if (error) throw error;

            // Refresh
            fetchPendingRequests();
            fetchLeaderboard();
        } catch (err) {
            console.error('Error accepting request:', err);
        }
    };

    const handleRejectRequest = async (friendshipId: string) => {
        try {
            const { error } = await supabase
                .from('friends')
                .delete()
                .eq('id', friendshipId);

            if (error) throw error;

            fetchPendingRequests();
        } catch (err) {
            console.error('Error rejecting request:', err);
        }
    };

    return (
        <div className="space-y-8 pb-32 relative p-4 pt-8 min-h-screen">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(69,162,158,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(69,162,158,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none -z-10" />

            <div className="space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-cyber-blue" />
                        <h1 className="text-2xl font-bold font-orbitron text-white tracking-wider text-glow">STATO RETE</h1>
                    </div>
                    <button
                        onClick={() => setIsAddFriendOpen(true)}
                        className="p-2 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg text-cyber-blue hover:bg-cyber-blue/20 transition-colors"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-black/40 rounded-xl border border-cyber-gray/20">
                    <button
                        onClick={() => setLeaderboardTab('global')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                            leaderboardTab === 'global'
                                ? "bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 shadow-[0_0_10px_rgba(69,162,158,0.1)]"
                                : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <Globe className="w-4 h-4" /> Globale
                    </button>
                    <button
                        onClick={() => setLeaderboardTab('friends')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                            leaderboardTab === 'friends'
                                ? "bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 shadow-[0_0_10px_rgba(69,162,158,0.1)]"
                                : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <Users className="w-4 h-4" /> Squadra
                    </button>
                </div>

                {/* Pending Requests */}
                {leaderboardTab === 'friends' && pendingRequests.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <h3 className="text-xs font-bold text-cyber-gray uppercase tracking-widest mb-2">Richieste in attesa</h3>
                        {pendingRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-cyber-blue/5 border border-cyber-blue/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyber-gray/30 flex items-center justify-center text-xs font-bold font-mono">
                                        {req.profile.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-white">{req.profile.username}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAcceptRequest(req.id)} className="p-1.5 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleRejectRequest(req.id)} className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Leaderboard List */}
                <div className="space-y-2">
                    {loading ? (
                        <div className="text-center py-10 text-zinc-500 animate-pulse">Caricamento dati rete...</div>
                    ) : leaderboardData.length === 0 ? (
                        <div className="text-center py-10 text-zinc-500">
                            {leaderboardTab === 'friends' ? "Nessun membro nella squadra. Invita qualcuno!" : "Nessun dato disponibile."}
                        </div>
                    ) : (
                        leaderboardData.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "flex items-center p-3 rounded-xl border transition-all relative overflow-hidden",
                                    entry.id === user?.id
                                        ? "border-cyber-blue bg-cyber-blue/5"
                                        : "border-white/5 bg-black/20 hover:bg-white/5"
                                )}
                            >
                                {entry.id === user?.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyber-blue shadow-[0_0_10px_#66FCF1]" />
                                )}

                                <div className={cn(
                                    "w-8 h-8 flex items-center justify-center font-bold font-mono rounded-full mr-3 text-sm",
                                    index === 0 ? "text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" :
                                        index === 1 ? "text-zinc-300" :
                                            index === 2 ? "text-amber-700" : "text-zinc-600"
                                )}>
                                    {index < 3 ? <Medal className="w-5 h-5" /> : `#${entry.rank}`}
                                </div>

                                <div className="w-8 h-8 bg-cyber-gray/30 rounded-full flex items-center justify-center mr-3 overflow-hidden border border-white/10">
                                    {entry.avatar_url ? (
                                        <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <Cpu className="w-4 h-4 text-cyber-gray" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className={cn(
                                        "font-bold text-sm tracking-wide",
                                        entry.id === user?.id ? "text-cyber-blue text-glow" : "text-zinc-300"
                                    )}>
                                        {entry.username}
                                    </h3>
                                </div>

                                <div className="text-right">
                                    <span className="font-mono text-cyber-purple font-bold text-xs tracking-wider">{entry.xp} XP</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {user && (
                <AddFriendModal
                    isOpen={isAddFriendOpen}
                    onClose={() => setIsAddFriendOpen(false)}
                    currentUserId={user.id}
                />
            )}
        </div>
    );
}
