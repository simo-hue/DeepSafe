import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Throttling/Security Check (Mock)
        // In a real app, you'd check a 'last_ad_watch_timestamp' in the DB to prevent spamming.
        // For now, we trust the client's 15s delay (which is not secure, but fits the simulation).

        // Fetch current hearts
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('current_hearts')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const currentHearts = profile.current_hearts || 0;
        if (currentHearts >= 5) {
            return NextResponse.json({ message: 'Hearts already full' });
        }

        // Add +1 Heart
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ current_hearts: currentHearts + 1 })
            .eq('id', userId);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update hearts' }, { status: 500 });
        }

        return NextResponse.json({ success: true, newHearts: currentHearts + 1 });
    } catch (error) {
        console.error('Ad Reward Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
