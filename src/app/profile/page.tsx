'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Edit2,
    Save,
    X,
    Trophy,
    Flame,
    Zap,
    Users,
    Globe,
    Medal,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    xp: number;
    highest_streak: number;
    bio?: string; // Add to schema if not exists, or use metadata
}

interface LeaderboardEntry {
    id: string;
    username: string;
    avatar_url: string | null;
    xp: number;
    rank: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Edit Form State
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');

    // Leaderboard State
    const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'friends'>('global');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<number>(0);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user) {
            fetchLeaderboard();
        }
    }, [user, leaderboardTab]);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUser(user);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setProfile(data as any); // Cast for bio if missing in types
            setEditName(data.username || '');
            setEditBio((data as any).bio || 'Cyber Security Recruit');
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        // Mock data for now since we might not have enough users/friends
        // In real impl, this would be a Supabase query
        const mockData: LeaderboardEntry[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `user-${i}`,
            username: i === 0 ? 'CyberMaster' : `Agent_${100 + i}`,
            avatar_url: null,
            xp: 5000 - (i * 200),
            rank: i + 1
        }));

        // Inject current user into mock data for demo
        if (profile) {
            const userEntry = {
                id: profile.id,
                username: profile.username,
                avatar_url: profile.avatar_url,
                xp: profile.xp,
                rank: 42
            };
            // Randomly place user or keep separate
            setUserRank(42);
        }

        setLeaderboardData(mockData);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar!');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: editName,
                    // bio: editBio // Add bio column to DB first
                })
                .eq('id', user.id);

            if (error) throw error;

            setProfile(prev => prev ? { ...prev, username: editName } : null);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const getRankTitle = (xp: number) => {
        if (xp < 100) return 'Recruit';
        if (xp < 500) return 'Script Kiddie';
        if (xp < 1000) return 'White Hat';
        if (xp < 2500) return 'Cyber Sentinel';
        return 'Netrunner Legend';
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen text-cyber-blue">Initializing Identity...</div>;

    return (
        <div className="space-y-8 pb-24">
            {/* Section A: Agent ID Card */}
            <div className="relative">
                <div className="absolute inset-0 bg-cyber-blue/5 blur-3xl rounded-full -z-10" />

                <div className="glass-panel p-6 rounded-2xl border border-cyber-blue/30 relative overflow-hidden group">
                    {/* Holographic Scan Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyber-blue/50 shadow-[0_0_15px_#45A29E] animate-scan opacity-50 pointer-events-none" />

                    <div className="flex flex-col items-center text-center space-y-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-2 border-cyber-blue p-1 relative group-hover:shadow-[0_0_20px_#45A29E] transition-all duration-500">
                                <div className="w-full h-full rounded-full overflow-hidden bg-cyber-dark relative">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-cyber-gray text-2xl font-bold font-orbitron">
                                            {profile?.username?.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Upload Overlay */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyber-dark border border-cyber-blue px-3 py-0.5 rounded-full text-[10px] font-orbitron text-cyber-blue tracking-widest whitespace-nowrap">
                                LVL {Math.floor((profile?.xp || 0) / 100) + 1}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="space-y-1 w-full">
                            {isEditing ? (
                                <div className="space-y-3 animate-in fade-in">
                                    <div className="space-y-1 text-left">
                                        <label className="text-xs text-cyber-blue font-mono">CODENAME</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-cyber-dark/80 border border-cyber-blue/50 rounded p-2 text-cyber-green font-mono text-sm focus:outline-none focus:shadow-[0_0_10px_rgba(69,162,158,0.3)]"
                                        />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-xs text-cyber-blue font-mono">BIO_DATA</label>
                                        <textarea
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            className="w-full bg-cyber-dark/80 border border-cyber-blue/50 rounded p-2 text-cyber-green font-mono text-sm focus:outline-none focus:shadow-[0_0_10px_rgba(69,162,158,0.3)] h-20 resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex-1 bg-cyber-blue text-cyber-dark font-bold py-2 rounded hover:bg-cyber-green transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" /> SAVE
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-3 border border-cyber-red text-cyber-red rounded hover:bg-cyber-red/10 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-2">
                                        <h1 className="text-2xl font-bold font-orbitron text-white tracking-wide">
                                            {profile?.username}
                                        </h1>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-cyber-gray hover:text-cyber-blue transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-cyber-blue font-mono">
                                        {getRankTitle(profile?.xp || 0)}
                                    </p>
                                    <p className="text-sm text-zinc-400 max-w-[250px] mx-auto italic">
                                        "{editBio}"
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section B: Vital Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center gap-1 border-cyber-purple/20">
                    <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                    <span className="text-xl font-bold font-orbitron text-white">{profile?.highest_streak}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Streak</span>
                </div>
                <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center gap-1 border-cyber-purple/20">
                    <Zap className="w-6 h-6 text-cyber-purple" />
                    <span className="text-xl font-bold font-orbitron text-white">{profile?.xp}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Total XP</span>
                </div>
                <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center gap-1 border-cyber-purple/20">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <span className="text-xl font-bold font-orbitron text-white">#{userRank}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Global</span>
                </div>
            </div>

            {/* Section C: Holo-Leaderboard */}
            <div className="space-y-4">
                <div className="flex p-1 bg-cyber-dark/50 rounded-xl border border-cyber-gray/20">
                    <button
                        onClick={() => setLeaderboardTab('global')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                            leaderboardTab === 'global'
                                ? "bg-cyber-blue/10 text-cyber-blue shadow-[0_0_10px_rgba(69,162,158,0.2)]"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Globe className="w-4 h-4" /> Global Network
                    </button>
                    <button
                        onClick={() => setLeaderboardTab('friends')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                            leaderboardTab === 'friends'
                                ? "bg-cyber-blue/10 text-cyber-blue shadow-[0_0_10px_rgba(69,162,158,0.2)]"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Users className="w-4 h-4" /> Squad
                    </button>
                </div>

                <div className="space-y-2">
                    <AnimatePresence mode='wait'>
                        {leaderboardData.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "flex items-center p-3 rounded-xl border transition-all",
                                    entry.id === user?.id
                                        ? "border-cyber-blue bg-cyber-blue/10 shadow-[0_0_10px_rgba(69,162,158,0.1)]"
                                        : "border-cyber-gray/20 bg-cyber-dark/40 hover:bg-cyber-gray/10"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 flex items-center justify-center font-bold font-orbitron rounded-full mr-3",
                                    index === 0 ? "text-yellow-500" :
                                        index === 1 ? "text-zinc-400" :
                                            index === 2 ? "text-amber-700" : "text-cyber-gray"
                                )}>
                                    {index < 3 ? <Medal className="w-5 h-5" /> : `#${entry.rank}`}
                                </div>

                                <div className="w-8 h-8 bg-cyber-gray/30 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                    {entry.avatar_url ? (
                                        <img src={entry.avatar_url} alt={entry.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold">{entry.username.slice(0, 2).toUpperCase()}</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className={cn(
                                        "font-bold text-sm",
                                        entry.id === user?.id ? "text-cyber-blue" : "text-zinc-300"
                                    )}>
                                        {entry.username} {entry.id === user?.id && "(YOU)"}
                                    </h3>
                                </div>

                                <div className="text-right">
                                    <span className="font-mono text-cyber-purple font-bold text-sm">{entry.xp} XP</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
