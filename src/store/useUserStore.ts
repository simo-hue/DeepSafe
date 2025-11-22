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

    // Actions
    addXp: (amount: number) => void;
    incrementStreak: () => void;
    resetStreak: () => void;
    decrementLives: () => void;
    refillLives: () => void;
    setInfiniteLives: (active: boolean) => void;
    refreshProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            xp: 0,
            streak: 0,
            lives: 5,
            maxLives: 5,
            hasInfiniteLives: false,
            lastRefillTime: null,

            addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
            resetStreak: () => set({ streak: 0 }),
            decrementLives: () => set((state) => ({
                lives: Math.max(0, state.lives - 1),
                lastRefillTime: state.lives === state.maxLives ? Date.now() : state.lastRefillTime
            })),
            refillLives: () => set((state) => ({ lives: state.maxLives, lastRefillTime: null })),
            setInfiniteLives: (active) => set({ hasInfiniteLives: active }),
            refreshProfile: async () => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('xp, current_hearts, highest_streak')
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
                            streak: profile.highest_streak ?? 0
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
