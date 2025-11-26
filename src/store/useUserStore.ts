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

    // Actions
    addXp: (amount: number) => void;
    incrementStreak: () => void;
    resetStreak: () => void;
    decrementLives: () => void;
    addHeart: (amount: number) => void;
    refillLives: () => void;
    setInfiniteLives: (active: boolean) => void;
    unlockProvince: (id: string) => void;
    refreshProfile: () => Promise<void>;
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
            unlockedProvinces: ['CB', 'IS', 'AQ', 'CH', 'PE', 'TE', 'BA', 'BT', 'BR', 'FG', 'LE', 'TA'], // Default unlocked: Molise, Abruzzo, Puglia

            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
            resetStreak: () => set({ streak: 0 }),
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
                        .select('xp, current_hearts, highest_streak, unlocked_provinces')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        console.error('Error refreshing profile:', error);
                        return;
                    }

                    if (profile) {
                        set({
                            xp: profile.xp ?? 0,
                            lives: profile.current_hearts ?? 5,
                            streak: profile.highest_streak ?? 0,
                            unlockedProvinces: profile.unlocked_provinces ?? ['CB', 'IS', 'AQ', 'CH', 'PE', 'TE', 'BA', 'BT', 'BR', 'FG', 'LE', 'TA']
                        });
                        console.log('🔄 Profile refreshed from DB:', profile);
                    }
                } catch (err) {
                    console.error('Unexpected error refreshing profile:', err);
                }
            }
        }),
        {
            name: 'deepsafe-user-storage',
        }
    )
);
