export const XP_PER_QUIZ = 10;
export const XP_BONUS_PER_STREAK = 5;

export function calculateXp(baseXp: number, streak: number): number {
    const streakBonus = Math.min(streak * 0.1, 0.5); // Max 50% bonus
    return Math.round(baseXp * (1 + streakBonus));
}

export function calculateRewards(quiz: any, baseStreak: number) {
    let finalXp = calculateXp(quiz.xpReward, baseStreak);

    if (quiz.xp_multiplier) {
        finalXp *= quiz.xp_multiplier;
    }

    return {
        xp: finalXp,
        badgeId: quiz.badge_reward_id || null
    };
}
