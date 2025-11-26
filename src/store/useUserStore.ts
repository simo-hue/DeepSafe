import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

interface UserState {
    xp: number;
    streak: number;
    lives: number;
    maxLives: number;
    hasInfiniteLives: boolean;
    lastRefillTime: number | null;
    unlockedProvinces: string[]; // IDs of unlocked provinces
    provinceScores: Record<string, { score: number; maxScore: number; isCompleted: boolean }>;
    lastLoginDate: string | null; // ISO Date string YYYY-MM-DD
    earnedBadges: { id: string; earned_at: string }[];

    // Actions
    addXp: (amount: number) => void;
    incrementStreak: () => Promise<void>;
    resetStreak: () => Promise<void>;
    setLastLoginDate: (date: string) => Promise<void>;
    decrementLives: () => Promise<void>;
    addHeart: (amount: number) => Promise<void>;
    refillLives: () => Promise<void>;
    setInfiniteLives: (active: boolean) => void;
    unlockProvince: (id: string) => Promise<void>;
    updateProvinceScore: (id: string, score: number, maxScore: number, isCompleted: boolean) => Promise<void>;
    refreshProfile: () => Promise<void>;
    checkBadges: () => Promise<{ newBadges: string[] }>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            xp: 0,
            streak: 0,
            lives: 5,
            maxLives: 5,
            hasInfiniteLives: false,
            lastRefillTime: null,
            unlockedProvinces: ['CB', 'IS', 'FG'], // Molise (CB, IS) + Foggia (FG) unlocked by default
            provinceScores: {},
            lastLoginDate: null,
            earnedBadges: [],

            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
            updateProvinceScore: async (id, score, maxScore, isCompleted) => {
                const state = get();
                const currentData = state.provinceScores[id] || { score: 0, maxScore: 10, isCompleted: false };

                // Logic: Only update if score is higher OR if it wasn't completed before
                const shouldUpdate = score > currentData.score || (!currentData.isCompleted && isCompleted);

                if (!shouldUpdate) return;

                const newScores = {
                    ...state.provinceScores,
                    [id]: {
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
            refreshProfile: async () => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('xp, current_hearts, highest_streak, unlocked_provinces, province_scores, last_login, earned_badges')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        console.error('Error refreshing profile:', JSON.stringify(error, null, 2));
                        return;
                    }

                    if (profile) {
                        set({
                            xp: profile.xp ?? 0,
                            lives: profile.current_hearts ?? 5,
                            streak: profile.highest_streak ?? 0,
                            unlockedProvinces: profile.unlocked_provinces ?? ['CB', 'IS', 'FG'],
                            provinceScores: (profile.province_scores as any) ?? {},
                            lastLoginDate: profile.last_login ?? null,
                            earnedBadges: (profile.earned_badges as any) ?? [],
                        });
                        console.log('🔄 Profile refreshed from DB:', profile);
                    }
                } catch (err) {
                    console.error('Unexpected error refreshing profile:', err);
                }
            },
            checkBadges: async () => {
                const state = get();
                const { xp, streak, earnedBadges } = state;
                const newBadges: string[] = [];

                // Import BADGES_DATA dynamically
                const { BADGES_DATA } = await import('@/data/badgesData');
                const { provincesData } = await import('@/data/provincesData');

                const earnedBadgeIds = new Set(earnedBadges.map(b => b.id));
                const now = new Date().toISOString();

                for (const badge of BADGES_DATA) {
                    if (earnedBadgeIds.has(badge.id)) continue;

                    let unlocked = false;

                    switch (badge.condition.type) {
                        case 'xp_milestone':
                            if (typeof badge.condition.value === 'number' && xp >= badge.condition.value) {
                                unlocked = true;
                            }
                            break;
                        case 'streak_milestone':
                            if (typeof badge.condition.value === 'number' && streak >= badge.condition.value) {
                                unlocked = true;
                            }
                            break;
                        case 'first_mission':
                            const hasCompletedMission = Object.values(state.provinceScores).some(s => s.score > 0);
                            if (hasCompletedMission) unlocked = true;
                            break;
                        case 'region_master':
                            if (typeof badge.condition.value === 'string') {
                                const regionName = badge.condition.value;
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
                        ...newBadges.map(id => ({ id, earned_at: now }))
                    ];

                    set({ earnedBadges: updatedBadges });

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
                }

                return { newBadges };
            }
        }),
        {
            name: 'deepsafe-user-storage',
        }
    )
);
