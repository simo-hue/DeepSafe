import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

interface UserState {
    xp: number;
    credits: number; // NeuroCredits
    streak: number;
    lives: number;
    maxLives: number;
    hasInfiniteLives: boolean;
    lastRefillTime: number | null;
    unlockedProvinces: string[]; // IDs of unlocked provinces
    provinceScores: Record<string, {
        score: number;
        maxScore: number;
        isCompleted: boolean;
        missions?: Record<string, { score: number; maxScore: number; isCompleted: boolean }>;
    }>;
    lastLoginDate: string | null; // ISO Date string YYYY-MM-DD
    earnedBadges: { id: string; earned_at: string }[];
    streakFreezes: number;
    inventory: string[]; // List of item IDs
    ownedAvatars: string[]; // List of owned avatar IDs
    hasSeenTutorial: boolean;
    isPremium: boolean;
    globalRank: number | null;
    totalMissions: number;
    mapTier: 'level_1' | 'level_2' | 'level_3';
    completedTiers: string[];
    regionCosts: Record<string, number>;
    settings: {
        notifications: boolean;
        sound: boolean;
        haptics: boolean;
    };

    // Actions
    completeTutorial: () => void;
    updateSettings: (settings: Partial<{ notifications: boolean; sound: boolean; haptics: boolean }>) => Promise<void>;
    claimMission: (missionId: string) => Promise<boolean>;
    completeLevel: (levelId: string, score: number, earnedXp: number) => Promise<boolean>;
    addCredits: (amount: number) => Promise<void>;
    spendCredits: (amount: number) => Promise<boolean>;
    buyItem: (itemId: string, cost: number) => Promise<{ success: boolean; message?: string; reward?: any }>;
    useStreakFreeze: () => Promise<boolean>;
    incrementStreak: () => Promise<void>;
    resetStreak: () => Promise<void>;
    setLastLoginDate: (date: string) => Promise<void>;
    decrementLives: () => Promise<void>;
    addHeart: (amount: number) => Promise<void>;
    refillLives: () => Promise<void>;
    setInfiniteLives: (active: boolean) => void;
    unlockProvince: (id: string) => Promise<void>;
    unlockAvatar: (id: string) => Promise<void>;
    updateProvinceScore: (id: string, score: number, maxScore: number, isCompleted: boolean) => Promise<void>;
    updateMissionScore: (provinceId: string, missionId: string, score: number, maxScore: number, isCompleted: boolean) => Promise<void>;
    refreshProfile: () => Promise<void>;
    checkBadges: (force?: boolean) => Promise<{ newBadges: string[] }>;
    lastBadgeCheck: number | null;
    setPremium: (isPremium: boolean) => Promise<void>;
    fetchAdvancedStats: () => Promise<any>;
    upgradeMapTier: () => Promise<boolean>;
    fetchRegionCosts: () => Promise<void>;
    unlockRegion: (regionId: string) => Promise<{ success: boolean; message?: string }>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            xp: 0,
            credits: 100, // Starting bonus
            streak: 0,
            lives: 5,
            maxLives: 5,
            hasInfiniteLives: false,
            lastRefillTime: null,
            unlockedProvinces: ['CB', 'IS', 'FG'], // Molise (CB, IS) + Foggia (FG) unlocked by default
            provinceScores: {},
            lastLoginDate: null,
            earnedBadges: [],
            streakFreezes: 0,
            inventory: [],
            ownedAvatars: ['avatar_rookie'], // Default avatar
            hasSeenTutorial: false,
            isPremium: false,
            globalRank: null,
            totalMissions: 0,
            mapTier: 'level_1',
            completedTiers: [],
            regionCosts: {},
            lastBadgeCheck: null,
            settings: {
                notifications: true,
                sound: true,
                haptics: true
            },
            completeTutorial: async () => {
                set({ hasSeenTutorial: true });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('profiles')
                            .update({ has_seen_tutorial: true })
                            .eq('id', user.id);
                    }
                } catch (err) {
                    console.error('Error syncing tutorial status:', err);
                }
            },
            updateSettings: async (newSettings) => {
                const state = get();
                const updatedSettings = { ...state.settings, ...newSettings };
                set({ settings: updatedSettings });

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const updates: any = {};
                        if (newSettings.notifications !== undefined) updates.settings_notifications = newSettings.notifications;
                        if (newSettings.sound !== undefined) updates.settings_sound = newSettings.sound;
                        if (newSettings.haptics !== undefined) updates.settings_haptics = newSettings.haptics;

                        if (Object.keys(updates).length > 0) {
                            await supabase.from('profiles').update(updates).eq('id', user.id);
                        }
                    }
                } catch (err) {
                    console.error('Error syncing settings:', err);
                }
            },

            claimMission: async (missionId) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return false;

                    const { data, error } = await supabase.rpc('claim_mission_reward', {
                        p_user_id: user.id,
                        p_mission_id: missionId
                    });

                    if (error) {
                        console.error('Error claiming mission:', error);
                        return false;
                    }

                    const result = data as any;
                    if (result && result.success) {
                        await get().refreshProfile();
                        return true;
                    } else {
                        console.error('Claim failed:', result?.message);
                        return false;
                    }
                } catch (err) {
                    console.error('Unexpected error claiming mission:', err);
                    return false;
                }
            },

            completeLevel: async (levelId, score, earnedXp) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return false;

                    const { data, error } = await supabase.rpc('complete_level', {
                        p_user_id: user.id,
                        p_level_id: levelId,
                        p_score: score,
                        p_earned_xp: earnedXp
                    });

                    if (error) {
                        console.error('Error completing level:', error);
                        return false;
                    }

                    await get().refreshProfile();
                    // Dual Ledger: XP is now Lifetime NC, Credits are spendable wallet
                    // The RPC updates both.
                    return true;
                } catch (err) {
                    console.error('Unexpected error completing level:', err);
                    return false;
                }
            },

            addCredits: async (amount) => {
                const state = get();
                const newCredits = state.credits + amount;
                set({ credits: newCredits });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id);
                    }
                } catch (err) { console.error('Error syncing credits:', err); }
            },

            spendCredits: async (amount) => {
                const state = get();
                if (state.credits < amount) return false;

                const newCredits = state.credits - amount;
                set({ credits: newCredits });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id);
                    }
                } catch (err) { console.error('Error syncing credits:', err); }
                return true;
            },

            buyItem: async (itemId, cost) => {
                const state = get();
                // Optimistic check
                if (state.credits < cost) return { success: false, message: 'Crediti insufficienti' };

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return { success: false, message: 'Utente non autenticato' };

                    const { data, error } = await supabase.rpc('purchase_item', {
                        p_user_id: user.id,
                        p_item_id: itemId
                    });

                    if (error) {
                        console.error('Error purchasing item:', error);
                        return { success: false, message: error.message };
                    }

                    const result = data as any;
                    if (result && result.success) {
                        // Refresh profile to get updated state (credits, inventory, etc.)
                        await get().refreshProfile();
                        return {
                            success: true,
                            reward: {
                                type: result.reward_type,
                                value: result.reward_value
                            }
                        };
                    } else {
                        console.error('Purchase failed:', result?.message);
                        return { success: false, message: result?.message || 'Errore sconosciuto' };
                    }
                } catch (err) {
                    console.error('Unexpected error purchasing item:', err);
                    return { success: false, message: 'Errore imprevisto' };
                }
            },

            useStreakFreeze: async () => {
                const state = get();
                if (state.streakFreezes <= 0) return false;

                const newCount = state.streakFreezes - 1;
                set({ streakFreezes: newCount });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({ streak_freezes: newCount }).eq('id', user.id);
                    }
                } catch (err) { console.error('Error syncing streak freeze usage:', err); }
                return true;
            },

            updateProvinceScore: async (id, score, maxScore, isCompleted) => {
                const state = get();
                const currentData = state.provinceScores[id] || { score: 0, maxScore: 10, isCompleted: false };

                // Logic: Only update if score is higher OR if it wasn't completed before
                const shouldUpdate = score > currentData.score || (!currentData.isCompleted && isCompleted);

                if (!shouldUpdate) return;

                const newScores = {
                    ...state.provinceScores,
                    [id]: {
                        ...currentData,
                        score: Math.max(score, currentData.score), // Keep highest score
                        maxScore,
                        isCompleted: isCompleted || currentData.isCompleted // Keep completed status
                    }
                };
                set({ provinceScores: newScores });

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('profiles')
                            .update({ province_scores: newScores })
                            .eq('id', user.id);
                    }
                } catch (err) {
                    console.error('Error syncing province scores:', err);
                }
            },

            updateMissionScore: async (provinceId, missionId, score, maxScore, isCompleted) => {
                const state = get();
                const provinceData = state.provinceScores[provinceId] || { score: 0, maxScore: 0, isCompleted: false, missions: {} };
                const currentMissions = provinceData.missions || {};
                const currentMissionData = currentMissions[missionId] || { score: 0, maxScore: 0, isCompleted: false };

                // Only update if score is higher or newly completed
                if (score <= currentMissionData.score && currentMissionData.isCompleted) {
                    // Nothing to update for this mission
                    return;
                }

                const newMissionData = {
                    score: Math.max(score, currentMissionData.score),
                    maxScore,
                    isCompleted: isCompleted || currentMissionData.isCompleted
                };

                const newMissions = {
                    ...currentMissions,
                    [missionId]: newMissionData
                };

                // Recalculate Province Totals
                // Sum of all mission scores
                let totalScore = 0;
                let totalMaxScore = 0;
                let allCompleted = true;

                // We need to be careful here. If we have missions in the store that are not in the current list (e.g. deleted),
                // we might want to keep them or filter them. For now, we just sum up what's in the store.
                // Ideally, we'd sum based on the actual available missions, but the store doesn't know about quizData directly.
                // So we'll trust the accumulated state for now.
                Object.values(newMissions).forEach(m => {
                    totalScore += m.score;
                    totalMaxScore += m.maxScore;
                    if (!m.isCompleted) allCompleted = false;
                });

                const newProvinceData = {
                    ...provinceData,
                    score: totalScore,
                    maxScore: totalMaxScore,
                    isCompleted: allCompleted && Object.keys(newMissions).length > 0, // Simplified logic
                    missions: newMissions
                };

                const newScores = {
                    ...state.provinceScores,
                    [provinceId]: newProvinceData
                };

                set({ provinceScores: newScores });

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('profiles')
                            .update({ province_scores: newScores })
                            .eq('id', user.id);
                    }
                } catch (err) {
                    console.error('Error syncing mission scores:', err);
                }
            },
            incrementStreak: async () => {
                const state = get();
                const newStreak = state.streak + 1;
                set({ streak: newStreak });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({ highest_streak: newStreak }).eq('id', user.id);
                    }
                } catch (err) { console.error('Error syncing streak:', err); }
            },
            resetStreak: async () => {
                set({ streak: 1 });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({ highest_streak: 1 }).eq('id', user.id);
                    }
                } catch (err) { console.error('Error syncing streak:', err); }
            },
            setLastLoginDate: async (date) => {
                set({ lastLoginDate: date });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({ last_login: date }).eq('id', user.id);
                    }
                } catch (err) { console.error('Error syncing last login:', err); }
            },
            decrementLives: async () => {
                const state = get();
                const newLives = Math.max(0, state.lives - 1);
                const newLastRefillTime = state.lives === state.maxLives ? Date.now() : state.lastRefillTime;

                set({ lives: newLives, lastRefillTime: newLastRefillTime });

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({ current_hearts: newLives }).eq('id', user.id);
                    }
                } catch (err) { console.error('Error syncing hearts:', err); }
            },
            addHeart: async (amount: number) => {
                const state = get();
                const newLives = Math.min(state.maxLives, state.lives + amount);
                const newLastRefillTime = (state.lives + amount) >= state.maxLives ? null : state.lastRefillTime;

                set({ lives: newLives, lastRefillTime: newLastRefillTime });

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({ current_hearts: newLives }).eq('id', user.id);
                    }
                } catch (err) { console.error('Error syncing hearts:', err); }
            },
            refillLives: async () => {
                const state = get();
                set({ lives: state.maxLives, lastRefillTime: null });

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('profiles').update({ current_hearts: state.maxLives }).eq('id', user.id);
                    }
                } catch (err) { console.error('Error syncing hearts:', err); }
            },
            setInfiniteLives: (active) => set({ hasInfiniteLives: active }),
            unlockProvince: async (id) => {
                const state = get();
                if (state.unlockedProvinces.includes(id)) return;

                const newUnlocked = [...state.unlockedProvinces, id];
                set({ unlockedProvinces: newUnlocked });

                // Sync with Supabase
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('profiles')
                            .update({ unlocked_provinces: newUnlocked })
                            .eq('id', user.id);
                    }
                } catch (err) {
                    console.error('Error syncing unlocked provinces:', err);
                }
            },
            unlockAvatar: async (id) => {
                const state = get();
                if (state.ownedAvatars.includes(id)) return;

                const newOwned = [...state.ownedAvatars, id];
                set({ ownedAvatars: newOwned });

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('profiles')
                            .update({ owned_avatars: newOwned })
                            .eq('id', user.id);
                    }
                } catch (err) {
                    console.error('Error syncing owned avatars:', err);
                }
            },
            refreshProfile: async () => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('xp, current_hearts, highest_streak, unlocked_provinces, province_scores, last_login, earned_badges, credits, streak_freezes, inventory, owned_avatars, settings_notifications, settings_sound, settings_haptics, has_seen_tutorial, is_premium, map_tier, completed_tiers')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        console.error('Error refreshing profile:', JSON.stringify(error, null, 2));
                        return;
                    }

                    if (profile) {
                        set({
                            xp: profile.xp ?? 0,
                            credits: profile.credits ?? 100,
                            lives: profile.current_hearts ?? 5,
                            streak: profile.highest_streak ?? 0,
                            unlockedProvinces: profile.unlocked_provinces ?? ['CB', 'IS', 'FG'],
                            provinceScores: (profile.province_scores as any) ?? {},
                            lastLoginDate: profile.last_login ?? null,
                            earnedBadges: (profile.earned_badges as any) ?? [],
                            streakFreezes: profile.streak_freezes ?? 0,
                            inventory: (profile.inventory as any) ?? [],
                            ownedAvatars: (profile.owned_avatars as any) ?? ['avatar_rookie'],
                            settings: {
                                notifications: profile.settings_notifications ?? true,
                                sound: profile.settings_sound ?? true,
                                haptics: profile.settings_haptics ?? true
                            },
                            hasSeenTutorial: profile.has_seen_tutorial ?? false,
                            isPremium: profile.is_premium ?? false,
                            mapTier: (profile.map_tier as 'level_1' | 'level_2' | 'level_3') ?? 'level_1',
                            completedTiers: profile.completed_tiers ?? []
                        });
                        console.log('🔄 Profile refreshed from DB:', profile);

                        // Fetch Rank
                        const { data: rank, error: rankError } = await supabase.rpc('get_user_rank');
                        if (!rankError) {
                            set({ globalRank: rank });
                        }

                        // Fetch Total Missions Count
                        const { count: missionsCount, error: missionsError } = await supabase
                            .from('missions')
                            .select('*', { count: 'exact', head: true });

                        if (!missionsError && missionsCount !== null) {
                            set({ totalMissions: missionsCount });
                        }
                    }
                } catch (err) {
                    console.error('Unexpected error refreshing profile:', err);
                }
            },
            checkBadges: async (force = false) => {
                const state = get();
                const { xp, streak, earnedBadges, lastBadgeCheck } = state;

                // Cooldown check: 5 minutes (300000 ms)
                const nowTime = Date.now();
                if (!force && lastBadgeCheck && (nowTime - lastBadgeCheck < 300000)) {
                    return { newBadges: [] };
                }

                const newBadges: string[] = [];

                // Fetch badges from DB
                const { data: dbBadges, error } = await supabase
                    .from('badges')
                    .select('*');

                if (error || !dbBadges) {
                    console.error('Error fetching badges definitions:', error);
                    return { newBadges: [] };
                }

                // Import provincesData dynamically
                const { provincesData } = await import('@/data/provincesData');

                const earnedBadgeIds = new Set(earnedBadges.map(b => b.id));
                const now = new Date().toISOString();

                for (const badge of dbBadges) {
                    if (earnedBadgeIds.has(badge.id)) continue;

                    let unlocked = false;

                    switch (badge.condition_type) {
                        case 'xp_milestone':
                            if (badge.condition_value && xp >= Number(badge.condition_value)) {
                                unlocked = true;
                            }
                            break;
                        case 'streak_milestone':
                            if (badge.condition_value && streak >= Number(badge.condition_value)) {
                                unlocked = true;
                            }
                            break;
                        case 'first_mission':
                            const hasCompletedMission = Object.values(state.provinceScores).some(s => s.score > 0);
                            if (hasCompletedMission) unlocked = true;
                            break;
                        case 'region_master':
                            if (badge.condition_value) {
                                const regionName = badge.condition_value;
                                const regionProvinces = provincesData.filter(p => p.region === regionName);
                                const allCompleted = regionProvinces.every(p => {
                                    const scoreData = state.provinceScores[p.id];
                                    return scoreData && scoreData.isCompleted;
                                });
                                if (regionProvinces.length > 0 && allCompleted) {
                                    unlocked = true;
                                }
                            }
                            break;
                    }

                    if (unlocked) {
                        newBadges.push(badge.id);
                        earnedBadgeIds.add(badge.id);
                    }
                }

                if (newBadges.length > 0) {
                    const updatedBadges = [
                        ...earnedBadges,
                        ...newBadges.map(id => ({ id, earned_at: new Date().toISOString() }))
                    ];

                    set({ earnedBadges: updatedBadges, lastBadgeCheck: nowTime });

                    try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            await supabase
                                .from('profiles')
                                .update({ earned_badges: updatedBadges })
                                .eq('id', user.id);
                        }
                    } catch (err) {
                        console.error('Error syncing badges:', err);
                    }
                } else {
                    set({ lastBadgeCheck: nowTime });
                }

                return { newBadges };
            },
            setPremium: async (isPremium) => {
                set({ isPremium });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('profiles')
                            .update({ is_premium: isPremium })
                            .eq('id', user.id);
                    }
                } catch (err) {
                    console.error('Error syncing premium status:', err);
                }
            },
            fetchAdvancedStats: async () => {
                try {
                    const { data, error } = await supabase.rpc('get_advanced_stats');
                    if (error) {
                        console.error('Error fetching advanced stats:', JSON.stringify(error, null, 2));
                        return { error: error.message || 'Errore nel recupero delle statistiche' };
                    }
                    return data;
                } catch (err: any) {
                    console.error('Unexpected error fetching stats:', err);
                    return { error: err.message || 'Errore imprevisto' };
                }
            },
            upgradeMapTier: async () => {
                const state = get();
                const currentTier = state.mapTier;
                let nextTier: 'level_1' | 'level_2' | 'level_3' | null = null;

                if (currentTier === 'level_1') nextTier = 'level_2';
                else if (currentTier === 'level_2') nextTier = 'level_3';

                if (!nextTier) return false;

                const newCompletedTiers = [...state.completedTiers, currentTier];
                const newUnlockedProvinces = ['CB', 'IS', 'FG']; // Reset to starters
                const newProvinceScores = {}; // Reset scores for new tier

                set({
                    mapTier: nextTier,
                    completedTiers: newCompletedTiers,
                    unlockedProvinces: newUnlockedProvinces,
                    provinceScores: newProvinceScores
                });

                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('profiles')
                            .update({
                                map_tier: nextTier,
                                completed_tiers: newCompletedTiers,
                                unlocked_provinces: newUnlockedProvinces,
                                province_scores: newProvinceScores
                            })
                            .eq('id', user.id);
                    }
                    return true;
                } catch (err) {
                    console.error('Error upgrading map tier:', err);
                    return false;
                }
            },
            fetchRegionCosts: async () => {
                try {
                    const { data, error } = await supabase
                        .from('regions')
                        .select('id, cost');

                    if (error) {
                        console.error('Error fetching region costs:', error);
                        return;
                    }

                    if (data) {
                        const costs: Record<string, number> = {};
                        data.forEach(r => {
                            costs[r.id] = r.cost;
                        });
                        set({ regionCosts: costs });
                    }
                } catch (err) {
                    console.error('Unexpected error fetching region costs:', err);
                }
            },
            unlockRegion: async (regionId) => {
                const state = get();
                const cost = state.regionCosts[regionId] || 1000; // Default fallback

                // 1. Check Credits
                if (state.credits < cost) {
                    return { success: false, message: `Insufficient credits. Need ${cost} NC.` };
                }

                // 2. Find All Provinces in Region
                const { provincesData } = await import('@/data/provincesData');
                const regionProvinces = provincesData.filter(p => p.region === regionId);

                if (regionProvinces.length === 0) {
                    return { success: false, message: 'Region data not found.' };
                }

                // Get all province IDs that are not yet unlocked
                const newProvinceIds = regionProvinces
                    .map(p => p.id)
                    .filter(id => !state.unlockedProvinces.includes(id));

                if (newProvinceIds.length === 0) {
                    // Already unlocked everything, but maybe we want to allow "re-unlocking" or just return success?
                    // For now, let's assume if they pay, they want to ensure it's unlocked.
                    // But if they already unlocked everything, they shouldn't be paying again?
                    // The UI should prevent this, but let's be safe.
                    return { success: true, message: 'Region already fully unlocked.' };
                }

                // 3. Deduct Credits
                const spent = await state.spendCredits(cost);
                if (!spent) {
                    return { success: false, message: 'Transaction failed.' };
                }

                // 4. Unlock All Provinces
                const newUnlocked = [...state.unlockedProvinces, ...newProvinceIds];
                set({ unlockedProvinces: newUnlocked });

                // Sync with Supabase
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('profiles')
                            .update({ unlocked_provinces: newUnlocked })
                            .eq('id', user.id);
                    }
                } catch (err) {
                    console.error('Error syncing unlocked provinces:', err);
                }

                return { success: true };
            }
        }),
        {
            name: 'deepsafe-user-storage',
        }
    )
);
