'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
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
    Loader2,
    Cpu,
    Activity,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

interface Profile {
    id: string;
    username: string;
    avatar_url: string | null;
    xp: number;
    highest_streak: number;
    bio?: string;
}

interface LeaderboardEntry {
    id: string;
    username: string;
    avatar_url: string | null;
    xp: number;
    rank: number;
}

import { MissionControl } from '@/components/gamification/MissionControl';
import { ArtifactGrid } from '@/components/gamification/ArtifactGrid';
import { Mission } from '@/components/gamification/MissionCard';
import { Badge } from '@/components/gamification/BadgeCard';

// Mock Data (Moved from AchievementsPage)
const MOCK_MISSIONS: Mission[] = [
    { id: '1', title: 'Accesso Giornaliero', target_count: 1, current_count: 1, reward_xp: 50, is_completed: true, is_claimed: false, frequency: 'daily' },
    { id: '2', title: 'Maestro dei Quiz', target_count: 3, current_count: 2, reward_xp: 150, is_completed: false, is_claimed: false, frequency: 'daily' },
    { id: '3', title: 'Serie Perfetta', target_count: 1, current_count: 1, reward_xp: 200, is_completed: true, is_claimed: true, frequency: 'weekly' },
];

const MOCK_BADGES: Badge[] = [
    { id: '1', name: 'Primi Passi', description: 'Hai completato il tuo primo quiz.', icon_url: '👣', category: 'General', xp_bonus: 50, is_unlocked: true, earned_at: '2024-05-20', rarity: 'common' },
    { id: '2', name: 'Portatore dello Scudo', description: 'Account protetto con 2FA.', icon_url: '🛡️', category: 'Defense', xp_bonus: 100, is_unlocked: true, earned_at: '2024-05-21', rarity: 'rare' },
    { id: '3', name: 'Leggenda Cyber', description: 'Completato il Buffer di 30 Giorni.', icon_url: '👑', category: 'Mastery', xp_bonus: 500, is_unlocked: true, earned_at: '2024-05-24', rarity: 'legendary' },
    { id: '4', name: 'Terminator di Phishing', description: 'Segnalati 10 tentativi di phishing.', icon_url: '🎣', category: 'Defense', xp_bonus: 200, is_unlocked: false, rarity: 'rare' },
    { id: '5', name: 'Demone della Velocità', description: 'Quiz finito in meno di 30s.', icon_url: '⚡', category: 'Speed', xp_bonus: 100, is_unlocked: false, rarity: 'common' },
    { id: '6', name: 'Ingegnere Sociale', description: 'Invitati 5 amici.', icon_url: '🤝', category: 'Social', xp_bonus: 150, is_unlocked: false, rarity: 'common' },
];

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

    // Vault State
    const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
    const [badges, setBadges] = useState<Badge[]>(MOCK_BADGES);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    const handleClaimMission = (id: string) => {
        setMissions(prev => prev.map(m =>
            m.id === id ? { ...m, is_claimed: true } : m
        ));
        // Trigger particle effect here
    };

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

            setProfile(data as any);
            setEditName(data.username || '');
            setEditBio((data as any).bio || 'Recluta Cyber Security');
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        // Mock data
        const mockData: LeaderboardEntry[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `user-${i}`,
            username: i === 0 ? 'CyberMaster' : `Agente_${100 + i}`,
            avatar_url: null,
            xp: 5000 - (i * 200),
            rank: i + 1
        }));

        if (profile) {
            setUserRank(42);
        }

        setLeaderboardData(mockData);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!user) {
                console.error('No user found');
                return;
            }
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Devi selezionare un\'immagine da caricare.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Errore caricamento avatar!');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update({
                    username: editName,
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
        if (xp < 100) return 'Recluta';
        if (xp < 500) return 'Script Kiddie';
        if (xp < 1000) return 'White Hat';
        if (xp < 2500) return 'Sentinella Cyber';
        return 'Leggenda Netrunner';
    };

    const getRankColor = (xp: number) => {
        if (xp < 100) return 'bg-zinc-600 text-zinc-100 border-zinc-500';
        if (xp < 500) return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue';
        if (xp < 1000) return 'bg-cyber-green/20 text-cyber-green border-cyber-green';
        if (xp < 2500) return 'bg-cyber-purple/20 text-cyber-purple border-cyber-purple';
        return 'bg-amber-500/20 text-amber-500 border-amber-500';
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen text-cyber-blue animate-pulse font-orbitron">INIZIALIZZAZIONE PROTOCOLLI IDENTITÀ...</div>;

    const currentLevel = Math.floor((profile?.xp || 0) / 100) + 1;
    const nextLevelXp = currentLevel * 100;
    const currentLevelXp = (profile?.xp || 0) - ((currentLevel - 1) * 100);
    const progressPercent = Math.min(100, (currentLevelXp / 100) * 100);

    return (
        <div className="space-y-8 pb-32 relative">
            {/* Background Grid for Profile Page */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(69,162,158,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(69,162,158,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none -z-10" />

            {/* Section A: Holo-ID Card */}
            <div className="relative pt-4">
                <div className="relative bg-cyber-gray/50 backdrop-blur-xl rounded-3xl border border-white/10 border-t-cyber-blue shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/10 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyber-purple/10 blur-[60px] rounded-full pointer-events-none" />

                    {/* Scanner Line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-50 animate-scan pointer-events-none" />

                    <div className="p-6 flex flex-col items-center relative z-10">
                        {/* Avatar Scanner */}
                        <div className="relative mb-20 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {/* Rotating Rings */}
                            <div className="absolute -inset-4 border border-cyber-blue/30 rounded-full border-dashed animate-spin-slow pointer-events-none" />
                            <div className="absolute -inset-2 border border-cyber-purple/30 rounded-full border-dotted animate-spin-reverse-slower pointer-events-none" />

                            {/* Avatar Container */}
                            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-cyber-blue/50 shadow-[0_0_20px_rgba(102,252,241,0.3)] relative bg-black">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-cyber-dark">
                                        <Users className="w-12 h-12 text-cyber-gray" />
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            {/* Level Badge */}
                            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-cyber-dark border border-cyber-blue px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 z-20">
                                <span className="text-[10px] text-cyber-gray font-mono uppercase">LIV</span>
                                <span className="text-lg font-bold font-orbitron text-white leading-none">{currentLevel}</span>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* User Info */}
                        <div className="w-full text-center space-y-4">
                            {isEditing ? (
                                <div className="space-y-4 w-full max-w-xs mx-auto animate-in fade-in slide-in-from-bottom-4">
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] text-cyber-blue font-mono uppercase tracking-widest">Nome in Codice</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full bg-black/60 border border-cyber-green/50 rounded-lg p-3 text-cyber-green font-mono text-sm focus:outline-none focus:border-cyber-green focus:shadow-[0_0_15px_rgba(0,255,136,0.2)]"
                                                autoFocus
                                            />
                                            <span className="absolute right-3 top-3 w-2 h-4 bg-cyber-green animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] text-cyber-blue font-mono uppercase tracking-widest">Dati_Bio</label>
                                        <textarea
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            className="w-full bg-black/60 border border-cyber-green/50 rounded-lg p-3 text-cyber-green font-mono text-sm focus:outline-none focus:border-cyber-green focus:shadow-[0_0_15px_rgba(0,255,136,0.2)] h-24 resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex-1 bg-cyber-green text-cyber-dark font-bold py-3 rounded-lg hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 font-orbitron tracking-wide shadow-[0_0_15px_rgba(102,252,241,0.3)] hover:shadow-[0_0_20px_rgba(102,252,241,0.6)]"
                                        >
                                            <Save className="w-4 h-4" /> SALVA DATI
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 border border-cyber-red text-cyber-red rounded-lg hover:bg-cyber-red hover:text-white transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-bold font-orbitron text-white tracking-widest uppercase text-glow">
                                            {profile?.username || 'AGENTE_SCONOSCIUTO'}
                                        </h1>
                                        <div className={cn(
                                            "inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest border",
                                            getRankColor(profile?.xp || 0)
                                        )}>
                                            {getRankTitle(profile?.xp || 0)}
                                        </div>
                                    </div>

                                    {/* XP Progress Bar */}
                                    <div className="w-full max-w-xs mx-auto space-y-1">
                                        <div className="flex justify-between text-[10px] font-mono text-cyber-blue/70">
                                            <span>XP {currentLevelXp}</span>
                                            <span>PROSSIMO {100}</span>
                                        </div>
                                        <div className="h-1 bg-cyber-dark rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                className="h-full bg-cyber-blue shadow-[0_0_10px_#66FCF1]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-sm text-zinc-400 max-w-xs mx-auto italic font-mono leading-relaxed">
                                        "{editBio}"
                                    </p>

                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-4 px-6 py-2 bg-cyber-blue/10 border border-cyber-blue/50 text-cyber-blue rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-cyber-blue hover:text-cyber-dark transition-all duration-300"
                                    >
                                        Aggiorna Dati ID
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section B: Vitals Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 border border-cyber-gray/30 p-4 rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-cyber-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                    <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-white">{profile?.highest_streak}</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Serie Giorni</div>
                    </div>
                </div>

                <div className="bg-black/40 border border-cyber-gray/30 p-4 rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Zap className="w-6 h-6 text-cyber-purple animate-pulse" />
                    <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-white">{profile?.xp}</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">XP Totali</div>
                    </div>
                </div>

                <div className="bg-black/40 border border-cyber-gray/30 p-4 rounded-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Trophy className="w-6 h-6 text-yellow-500 animate-pulse" />
                    <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-white">{userRank > 0 ? `#${userRank}` : '--'}</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Rango Globale</div>
                    </div>
                </div>
            </div>

            {/* Section C: Holo-Leaderboard */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-cyber-blue" />
                    <h3 className="text-sm font-bold font-orbitron text-white tracking-wider">STATO RETE</h3>
                </div>

                <div className="flex p-1 bg-black/40 rounded-xl border border-cyber-gray/20">
                    <button
                        onClick={() => setLeaderboardTab('global')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            leaderboardTab === 'global'
                                ? "bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 shadow-[0_0_10px_rgba(69,162,158,0.1)]"
                                : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <Globe className="w-3 h-3" /> Globale
                    </button>
                    <button
                        onClick={() => setLeaderboardTab('friends')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            leaderboardTab === 'friends'
                                ? "bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 shadow-[0_0_10px_rgba(69,162,158,0.1)]"
                                : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        <Users className="w-3 h-3" /> Squadra
                    </button>
                </div>

                <div className="space-y-2">
                    {leaderboardData.map((entry, index) => (
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
                    ))}
                </div>
            </div>

            {/* Divider: AGENT RECORD */}
            <div className="relative flex items-center gap-4 py-4">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyber-gray to-transparent" />
                <div className="text-xs font-mono text-cyber-gray uppercase tracking-[0.2em]">// REGISTRO AGENTE</div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyber-gray to-transparent" />
            </div>

            {/* Section D: Mission Control */}
            <MissionControl missions={missions} onClaim={handleClaimMission} />

            {/* Section E: Artifact Grid */}
            <ArtifactGrid badges={badges} onSelectBadge={setSelectedBadge} />

            {/* Badge Inspection Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                        onClick={() => setSelectedBadge(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="bg-cyber-dark border border-cyber-blue/30 rounded-2xl p-1 max-w-sm w-full relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedBadge(null)}
                                className="absolute top-4 right-4 text-cyber-gray hover:text-white z-20"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Holographic Background */}
                            <div className="absolute inset-0 bg-gradient-to-b from-cyber-blue/5 to-transparent pointer-events-none" />

                            <div className="flex flex-col items-center text-center p-6 space-y-6 relative z-10">
                                {/* 3D Floating Badge */}
                                <div className="w-32 h-32 relative animate-float">
                                    <div className="absolute inset-0 bg-cyber-blue/20 blur-2xl rounded-full animate-pulse" />
                                    <div className="text-6xl relative z-10 drop-shadow-[0_0_20px_rgba(69,162,158,0.8)]">
                                        {selectedBadge.icon_url}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold font-orbitron text-white text-glow">
                                        {selectedBadge.name}
                                    </h3>
                                    <div className={cn(
                                        "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                                        selectedBadge.rarity === 'legendary' ? "border-amber-500 text-amber-500 bg-amber-500/10" :
                                            selectedBadge.rarity === 'rare' ? "border-cyber-purple text-cyber-purple bg-cyber-purple/10" :
                                                "border-cyber-blue text-cyber-blue bg-cyber-blue/10"
                                    )}>
                                        Manufatto {selectedBadge.rarity === 'legendary' ? 'Leggendario' : selectedBadge.rarity === 'rare' ? 'Raro' : 'Comune'}
                                    </div>
                                </div>

                                <p className="text-zinc-400 italic">
                                    "{selectedBadge.description}"
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-cyber-gray/20">
                                    <div className="text-center">
                                        <div className="text-xs text-cyber-gray font-mono uppercase">BONUS XP</div>
                                        <div className="text-xl font-bold text-cyber-green">+{selectedBadge.xp_bonus}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-cyber-gray font-mono uppercase">OTTENUTO IL</div>
                                        <div className="text-sm font-bold text-white">
                                            {selectedBadge.earned_at ? new Date(selectedBadge.earned_at).toLocaleDateString() : 'BLOCCATO'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
