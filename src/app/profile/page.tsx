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
    Shield,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import posthog from 'posthog-js';

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
    rank?: number;
}


import { useUserStore } from '@/store/useUserStore';
import { BADGES_DATA, BadgeDefinition } from '@/data/badgesData';
import { MissionControl } from '@/components/gamification/MissionControl';
import { ArtifactGrid } from '@/components/gamification/ArtifactGrid';
import { Mission } from '@/components/gamification/MissionCard';
import { Badge } from '@/components/gamification/BadgeCard';

const MOCK_MISSIONS: Mission[] = [
    { id: '1', title: 'Accesso Giornaliero', target_count: 1, current_count: 1, reward_xp: 50, is_completed: true, is_claimed: false, frequency: 'daily' },
    { id: '2', title: 'Maestro dei Quiz', target_count: 3, current_count: 2, reward_xp: 150, is_completed: false, is_claimed: false, frequency: 'daily' },
    { id: '3', title: 'Serie Perfetta', target_count: 1, current_count: 1, reward_xp: 200, is_completed: true, is_claimed: true, frequency: 'weekly' },
];

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, Volume2, Smartphone } from 'lucide-react';

type ToggleColor = 'blue' | 'purple' | 'orange';

function SettingsToggle({ checked, onChange, color = 'blue' }: { checked: boolean; onChange: (c: boolean) => void; color?: ToggleColor }) {
    const colorStyles = {
        blue: {
            active: "bg-cyan-500/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]",
            thumb: "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]",
        },
        purple: {
            active: "bg-purple-500/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]",
            thumb: "bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.8)]",
        },
        orange: {
            active: "bg-orange-500/20 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]",
            thumb: "bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]",
        }
    };

    const styles = colorStyles[color];

    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "w-14 h-7 rounded-full p-1 transition-all duration-300 ease-in-out relative border",
                checked ? styles.active : "bg-zinc-900/50 border-zinc-700 hover:border-zinc-600"
            )}
        >
            <motion.div
                className={cn(
                    "w-4 h-4 rounded-full shadow-md absolute top-1.5 left-1.5",
                    checked ? styles.thumb : "bg-zinc-500"
                )}
                animate={{ x: checked ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </button>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { earnedBadges, refreshProfile, settings, updateSettings, claimMission, inventory } = useUserStore();

    // Push Notifications
    const { isSupported, permission, subscribe, unsubscribe, loading: pushLoading } = usePushNotifications();

    // -- State Management --
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Edit Form State
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');

    // Gamification State
    const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    // Sync Missions with Inventory (Claimed Status)
    useEffect(() => {
        if (inventory) {
            setMissions(prev => prev.map(m => ({
                ...m,
                is_claimed: inventory.includes(`mission_${m.id}`) || m.is_claimed
            })));
        }
    }, [inventory]);

    // Compute Badges with Unlock Status
    const badges = BADGES_DATA.map(badgeDef => {
        const earned = earnedBadges.find(b => b.id === badgeDef.id);
        return {
            id: badgeDef.id,
            name: badgeDef.name,
            description: badgeDef.description,
            icon_url: badgeDef.icon,
            category: badgeDef.category,
            xp_bonus: badgeDef.xpReward,
            is_unlocked: !!earned,
            earned_at: earned?.earned_at,
            rarity: badgeDef.rarity
        };
    }).filter(b => b.is_unlocked);

    /**
     * Handles the "Claim" action for a mission.
     * In a real app, this would call an API to award XP and update the DB.
     */
    const handleClaimMission = async (id: string) => {
        const mission = missions.find(m => m.id === id);
        if (!mission || mission.is_claimed) return;

        // Optimistic update
        setMissions(prev => prev.map(m =>
            m.id === id ? { ...m, is_claimed: true } : m
        ));

        const success = await claimMission(id);

        if (!success) {
            // Revert if failed
            setMissions(prev => prev.map(m =>
                m.id === id ? { ...m, is_claimed: false } : m
            ));
            alert('Errore durante il riscatto della missione. Riprova.');
        } else {
            // Trigger particle effect here
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);



    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // Identify user in PostHog
            posthog.identify(user.id, {
                email: user.email
            });

            setUser(user);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // Calculate Rank
            const { count, error: rankError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gt('xp', data.xp);

            if (rankError) console.error('Error fetching rank:', rankError);

            const rank = (count || 0) + 1;

            setProfile({ ...data, rank } as any);
            setEditName(data.username || '');
            setEditBio((data as any).bio || 'Recluta Cyber Security');
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
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

                    {/* Notification Toggle */}
                    {isSupported && (
                        <button
                            onClick={permission === 'granted' ? unsubscribe : subscribe}
                            disabled={pushLoading}
                            className={`absolute top-4 right-4 z-30 p-2 rounded-full border transition-all ${permission === 'granted'
                                ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue hover:bg-cyber-blue/30'
                                : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            {pushLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : permission === 'granted' ? (
                                <Bell className="w-5 h-5" />
                            ) : (
                                <BellOff className="w-5 h-5" />
                            )}
                        </button>
                    )}

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
                                    <div className="w-full max-w-xs mx-auto space-y-2 mt-4">
                                        <div className="flex justify-between items-end px-1">
                                            <div className="text-left">
                                                <div className="text-[9px] font-bold tracking-widest text-cyber-gray uppercase">XP Correnti</div>
                                                <div className="text-lg font-bold font-orbitron text-cyber-blue text-glow leading-none">{currentLevelXp}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] font-bold tracking-widest text-cyber-gray uppercase">Prossimo Livello</div>
                                                <div className="text-lg font-bold font-orbitron text-cyber-purple text-glow leading-none">{100}</div>
                                            </div>
                                        </div>

                                        {/* Enhanced Progress Bar Container */}
                                        <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                                            {/* Background pattern */}
                                            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_10px)]" />

                                            {/* Fill with gradient */}
                                            <motion.div
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-blue shadow-[0_0_15px_rgba(69,162,158,0.6)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 1, ease: "circOut" }}
                                            >
                                                {/* Leading Edge Shine */}
                                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/80 shadow-[0_0_10px_white]" />

                                                {/* Animated shimmer effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                            </motion.div>
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
                        <div className="text-2xl font-bold font-mono text-white">#{profile?.rank || '-'}</div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Rango Globale</div>
                    </div>
                </div>
            </div>



            {/* Section C: Settings */}
            <div className="bg-black/40 border border-cyber-gray/30 rounded-xl p-6 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/5 blur-[40px] rounded-full pointer-events-none" />

                <h3 className="text-lg font-bold font-orbitron text-white flex items-center gap-2 relative z-10">
                    <Cpu className="w-5 h-5 text-cyber-blue" />
                    CONFIGURAZIONE SISTEMA
                </h3>

                <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-cyber-blue/10 text-cyber-blue group-hover:bg-cyber-blue/20 transition-colors">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white font-orbitron tracking-wide">NOTIFICHE PUSH</div>
                                <div className="text-xs text-zinc-500 font-mono">Ricevi aggiornamenti sulle missioni</div>
                            </div>
                        </div>
                        <SettingsToggle
                            checked={settings.notifications}
                            onChange={(checked) => updateSettings({ notifications: checked })}
                            color="blue"
                        />
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-cyber-purple/10 text-cyber-purple group-hover:bg-cyber-purple/20 transition-colors">
                                <Volume2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white font-orbitron tracking-wide">EFFETTI SONORI</div>
                                <div className="text-xs text-zinc-500 font-mono">Suoni interfaccia e feedback</div>
                            </div>
                        </div>
                        <SettingsToggle
                            checked={settings.sound}
                            onChange={(checked) => updateSettings({ sound: checked })}
                            color="purple"
                        />
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white font-orbitron tracking-wide">FEEDBACK APTICO</div>
                                <div className="text-xs text-zinc-500 font-mono">Vibrazione su interazioni</div>
                            </div>
                        </div>
                        <SettingsToggle
                            checked={settings.haptics}
                            onChange={(checked) => updateSettings({ haptics: checked })}
                            color="orange"
                        />
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full mt-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 font-bold font-orbitron tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        DISCONNETTI SISTEMA
                    </button>
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
