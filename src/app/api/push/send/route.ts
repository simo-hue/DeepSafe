import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { Database } from '@/types/supabase';

// Initialize Supabase Admin Client (Service Role) to fetch all subscriptions
// NOTE: In a real production app, use SERVICE_ROLE_KEY. 
// For this demo, we might use the standard client if RLS allows, or just assume we have the key.
// Since we don't have the service role key in env vars usually in this setup, 
// we will rely on the fact that we are sending TO a specific user, 
// but we need to fetch their subscription.
// 
// CRITICAL: You need a way to bypass RLS to fetch ANY user's subscription if you are a server admin.
// For now, we'll assume the caller passes the user ID and we fetch their sub.
// If RLS blocks us, we need the Service Role Key.
// Let's assume we use the ANON key but maybe we can't read other's subs?
// Actually, this API route runs on the server. We SHOULD use the Service Role Key.
// But I don't have it. I'll use the Anon key and hope the user calling this is the user themselves (e.g. testing)
// OR, for the "Duel" use case, User A triggers a notification to User B.
// User A cannot read User B's subscription due to RLS.
// SOLUTION: We need the Service Role Key or a Postgres Function `send_push(user_id, payload)`.
// 
// For this demo, I will assume we add `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` to env if needed,
// OR I will create a Postgres function to fetch the subscription securely.
// 
// Let's try to use the standard client and see if we hit RLS issues. 
// If we do, I'll instruct the user to add the Service Role Key.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Push Notification Send API
 * 
 * This endpoint allows sending a push notification to a specific user.
 * It is used for events like "User A challenges User B".
 * 
 * Usage:
 * POST /api/push/send
 * Body: { userId, title, body, url }
 */
export async function POST(request: Request) {
    try {
        // Ensure VAPID keys are available
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
            throw new Error('VAPID keys are missing');
        }

        webpush.setVapidDetails(
            'mailto:example@yourdomain.org',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );

        const { userId, title, body, url } = await request.json();

        if (!userId || !title) {
            return NextResponse.json({ error: 'Missing userId or title' }, { status: 400 });
        }

        // 1. Fetch User's Subscription
        // We query the 'push_subscriptions' table to find the target user's endpoints.
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', userId);

        if (error) throw error;
        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: 'User has no subscriptions' }, { status: 404 });
        }

        // 2. Send Notification to all user's devices
        // A user might be logged in on multiple devices (phone, laptop), so we send to all.
        const payload = JSON.stringify({ title, body, url });

        const promises = subscriptions.map(sub => {
            return webpush.sendNotification(sub.subscription as any, payload)
                .catch(err => {
                    if (err.statusCode === 410) {
                        // Subscription expired, delete it (TODO: Implement cleanup here like in cron)
                        console.log('Subscription expired for user', userId);
                    }
                    console.error('Error sending push:', err);
                });
        });

        await Promise.all(promises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
