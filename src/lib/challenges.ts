import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize client (this would normally use env vars)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Creates a new 1v1 challenge (Duel) between the current user and a friend.
 * 
 * Flow:
 * 1. Check if a pending challenge already exists to prevent duplicates.
 * 2. Insert a new record into the 'challenges' table.
 * 3. Trigger a push notification to the opponent via the API.
 * 
 * @param challengerId - ID of the user sending the challenge
 * @param opponentId - ID of the user receiving the challenge (renamed from friendId for consistency)
 * @param quizId - ID of the quiz to be played (optional/future use)
 * @returns The created challenge object or an error message
 */
export async function challengeFriend(challengerId: string, opponentId: string, quizId: string) {
    try {
        // 1. Check if a pending challenge already exists
        const { data: existing, error: fetchError } = await supabase
            .from('challenges')
            .select('*')
            .eq('challenger_id', challengerId)
            .eq('opponent_id', opponentId)
            .eq('status', 'pending')
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found"
            throw fetchError;
        }

        if (existing) {
            return { success: false, message: 'Challenge already pending!' };
        }

        // 2. Create the challenge record
        const { data, error } = await supabase
            .from('challenges')
            .insert({
                challenger_id: challengerId,
                opponent_id: opponentId,
                quiz_id: quizId, // Required by DB schema
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // 3. Send Push Notification to the opponent
        // We call our own API route to handle the secure sending logic
        try {
            fetch('/api/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: opponentId,
                    title: '⚔️ Nuova Sfida!',
                    body: 'Un amico ti ha sfidato a duello. Accetta ora!',
                    url: '/dashboard'
                })
            }).catch(pushError => console.error('Failed to send push notification:', pushError));
        } catch (pushError) {
            console.error('Failed to send push notification:', pushError);
        }

        return { success: true, challenge: data, message: 'Challenge sent!' };

    } catch (error) {
        console.error('Error creating challenge:', error);
        return { success: false, message: 'Failed to create challenge.' };
    }
}

/**
 * Fetches all pending challenges where the user is the opponent.
 * Used to display the "Accept Challenge" cards on the dashboard.
 */
export async function getPendingChallenges(userId: string) {
    const { data, error } = await supabase
        .from('challenges')
        .select(`
            *,
            challenger:profiles!challenges_challenger_id_fkey(username, avatar_url)
        `)
        .eq('opponent_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching challenges:', error);
        return [];
    }
    return data;
}

/**
 * Submits the score for a duel and determines the winner if both have played.
 * 
 * Logic:
 * 1. Fetch the current state of the challenge.
 * 2. Update the score for the current user (challenger or opponent).
 * 3. Check if both scores are now present.
 * 4. If both played, compare scores and set the 'winner_id'.
 * 
 * @param challengeId - ID of the challenge
 * @param userId - ID of the user submitting the score
 * @param score - The score achieved in the quiz
 */
export async function submitDuelScore(challengeId: string, userId: string, score: number) {
    try {
        // 1. Get current challenge data
        const { data: challenge, error: fetchError } = await supabase
            .from('challenges')
            .select('*')
            .eq('id', challengeId)
            .single();

        if (fetchError || !challenge) throw fetchError || new Error('Challenge not found');

        const updates: any = {};

        // 2. Determine which score to update & Check for winner
        // We need to compare the NEW score with the EXISTING score of the other player

        let challengerScore = challenge.challenger_score;
        let opponentScore = challenge.opponent_score;

        if (userId === challenge.challenger_id) {
            updates.challenger_score = score;
            challengerScore = score;
        } else if (userId === challenge.opponent_id) {
            updates.opponent_score = score;
            opponentScore = score;
        }

        // 3. If both scores are present, determine winner
        if (challengerScore !== null && opponentScore !== null) {
            updates.status = 'completed';
            if (challengerScore > opponentScore) {
                updates.winner_id = challenge.challenger_id;
            } else if (opponentScore > challengerScore) {
                updates.winner_id = challenge.opponent_id;
            } else {
                updates.winner_id = 'draw'; // Draw
            }
        }

        // 4. Update the record
        const { error: updateError } = await supabase
            .from('challenges')
            .update(updates)
            .eq('id', challengeId);

        if (updateError) throw updateError;
        return { success: true };

    } catch (error) {
        console.error('Error submitting duel score:', error);
        return { success: false, message: 'Failed to submit score.' };
    }
}
