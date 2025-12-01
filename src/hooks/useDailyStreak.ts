import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { getToday, isYesterday } from '@/utils/dateUtils';

export const useDailyStreak = (enabled: boolean = true) => {
    const { streak, lastStreakDate, incrementStreak, resetStreak } = useUserStore();
    const [showModal, setShowModal] = useState(false);
    const hasChecked = useRef(false); // Prevent double-check on strict mode/remounts

    useEffect(() => {
        if (!enabled || hasChecked.current) return;

        const checkStreak = () => {
            const today = getToday();
            const STREAK_MODAL_KEY = 'deepsafe_streak_modal_pending';
            const STREAK_PREV_KEY = 'deepsafe_streak_prev';

            // Case 1: Same Day (Already logged in today)
            if (lastStreakDate === today) {
                // Check if we have a pending modal from a previous mount/reload
                if (sessionStorage.getItem(STREAK_MODAL_KEY) === 'true') {
                    setShowModal(true);
                    hasChecked.current = true;
                }
                return;
            }

            // Case 2: Consecutive Day (Last login was yesterday)
            if (lastStreakDate && isYesterday(lastStreakDate)) {
                sessionStorage.setItem(STREAK_PREV_KEY, String(streak));
                incrementStreak();
                // setLastLoginDate(today); // Handled by incrementStreak now
                sessionStorage.setItem(STREAK_MODAL_KEY, 'true');
                setShowModal(true);
                hasChecked.current = true;
                return;
            }

            // Case 3: Broken Streak or First Time (Last login older than yesterday or null)
            // Reset to 1 (since user logged in today)
            sessionStorage.setItem(STREAK_PREV_KEY, String(streak));
            resetStreak();
            // setLastLoginDate(today); // Handled by resetStreak now
            sessionStorage.setItem(STREAK_MODAL_KEY, 'true');
            setShowModal(true);
            hasChecked.current = true;
        };

        checkStreak();
    }, [lastStreakDate, incrementStreak, resetStreak, enabled]);

    const closeModal = () => {
        sessionStorage.removeItem('deepsafe_streak_modal_pending');
        setShowModal(false);
    };

    const previousStreak = typeof window !== 'undefined'
        ? parseInt(sessionStorage.getItem('deepsafe_streak_prev') || '0')
        : 0;

    return {
        streak,
        showModal,
        closeModal,
        previousStreak
    };
};
