'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { challengeFriend } from '@/lib/challenges';

interface Friend {
    id: string;
    username: string;
    xp: number;
    avatar: string;
    rank: number;
}

interface FriendListProps {
    friends: Friend[];
    currentUserId: string;
    referralCode: string;
}

export function FriendList({ friends, currentUserId, referralCode }: FriendListProps) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleInvite = async () => {
        const text = `Learn AI Safety and beat my score on Deepsafe! Use my code: ${referralCode}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Deepsafe',
                    text: text,
                    url: window.location.origin,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(text);
            alert('Invite copied to clipboard!');
        }
    };

    /**
     * Initiates a duel with a friend.
     * 
     * 1. Calls the challengeFriend function in lib/challenges.ts
     * 2. Redirects the user to the Quiz page in 'duel' mode.
     */
    const handleChallenge = async (friendId: string) => {
        setLoadingId(friendId); // Set loading state for the specific friend
        // Optimistic UI update or loading state could be added here
        // Using currentUserId from props as 'user' is not defined in this scope.
        // 'quiz-1' is used as a placeholder ID for the quiz.
        const result = await challengeFriend(currentUserId, friendId, 'quiz-1');

        if (result.success && result.challenge) {
            // Redirect to the quiz page with the challenge ID
            // The QuizPage will handle the logic for 'duel' mode
            router.push(`/quiz/quiz-1?mode=duel&challengeId=${result.challenge.id}`);
        } else {
            alert(result.message || 'Errore durante la sfida'); // Provide a fallback error message
        }
        setLoadingId(null); // Reset loading state
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {friends.map((friend) => (
                    <div
                        key={friend.id}
                        className="flex items-center p-4 rounded-xl border-2 border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        <div className="w-8 h-8 flex items-center justify-center font-bold text-zinc-500 mr-4">
                            #{friend.rank}
                        </div>

                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-xl mr-3">
                            {friend.avatar}
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-sm">{friend.username}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{friend.xp} XP</p>
                        </div>

                        {friend.id !== currentUserId && (
                            <button
                                onClick={() => handleChallenge(friend.id)}
                                disabled={loadingId === friend.id}
                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                            >
                                <Swords className={cn("w-5 h-5", loadingId === friend.id && "animate-spin")} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleInvite}
                className="w-full py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center justify-center gap-2 transition-all"
            >
                <UserPlus className="w-5 h-5" />
                Invite a Friend (+Rewards)
            </button>
        </div>
    );
}
