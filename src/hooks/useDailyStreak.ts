import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { getToday, isYesterday } from '@/utils/dateUtils';

export const useDailyStreak = (enabled: boolean = true) => {
    const { streak, lastLoginDate, incrementStreak, resetStreak, setLastLoginDate } = useUserStore();
    const [showModal, setShowModal] = useState(false);
    const hasChecked = useRef(false); // Prevent double-check on strict mode/remounts

    useEffect(() => {
        if (!enabled || hasChecked.current) return;

        const checkStreak = () => {
            const today = getToday();
            const STREAK_MODAL_KEY = 'deepsafe_streak_modal_pending';

            // Case 1: Same Day (Already logged in today)
            if (lastLoginDate === today) {
                // Check if we have a pending modal from a previous mount/reload
                if (sessionStorage.getItem(STREAK_MODAL_KEY) === 'true') {
                    setShowModal(true);
                    hasChecked.current = true;
                }
                return;
            }

            // Case 2: Consecutive Day (Last login was yesterday)
            if (lastLoginDate && isYesterday(lastLoginDate)) {
                incrementStreak();
                setLastLoginDate(today);
                sessionStorage.setItem(STREAK_MODAL_KEY, 'true');
                setShowModal(true);
                hasChecked.current = true;
                return;
            }

            // Case 3: Broken Streak or First Time (Last login older than yesterday or null)
            // Reset to 1 (since user logged in today)
            resetStreak();
            setLastLoginDate(today);
            sessionStorage.setItem(STREAK_MODAL_KEY, 'true');
            setShowModal(true);
            hasChecked.current = true;
        };

        checkStreak();
    }, [lastLoginDate, incrementStreak, resetStreak, setLastLoginDate, enabled]);

    const closeModal = () => {
        sessionStorage.removeItem('deepsafe_streak_modal_pending');
        setShowModal(false);
    };

    return {
        streak,
        showModal,
        closeModal
    };
};
