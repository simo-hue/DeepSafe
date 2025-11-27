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

            // Case 1: Same Day (Already logged in today)
            if (lastLoginDate === today) {
                // Do nothing
                return;
            }

            // Case 2: Consecutive Day (Last login was yesterday)
            if (lastLoginDate && isYesterday(lastLoginDate)) {
                incrementStreak();
                setLastLoginDate(today);
                setShowModal(true);
                hasChecked.current = true;
                return;
            }

            // Case 3: Broken Streak or First Time (Last login older than yesterday or null)
            // Reset to 1 (since user logged in today)
            resetStreak();
            setLastLoginDate(today);
            setShowModal(true);
            hasChecked.current = true;
        };

        checkStreak();
    }, [lastLoginDate, incrementStreak, resetStreak, setLastLoginDate]);

    const closeModal = () => setShowModal(false);

    return {
        streak,
        showModal,
        closeModal
    };
};
