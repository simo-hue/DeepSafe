import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Daily Reminder Cron Job API
 * 
 * This endpoint is designed to be called by an external scheduler (like pg_cron or Vercel Cron)
 * to send daily push notifications to all subscribed users.
 * 
 * Security:
 * - Protected by a 'Authorization' header which must match the CRON_SECRET env var.
 * - This prevents unauthorized users from triggering mass notifications.
 * 
 * Flow:
 * 1. Validate CRON_SECRET.
 * 2. Initialize web-push with VAPID keys.
 * 3. Fetch all active subscriptions from Supabase.
 * 4. Send notifications in parallel.
 * 5. Clean up invalid subscriptions (410 Gone) to keep the DB clean.
 */
export async function GET(request: Request) {
    try {
        // 1. Security Check: Verify the caller has the correct secret
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ensure VAPID keys are present for signing the push packets
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
            throw new Error('VAPID keys are missing');
        }

        webpush.setVapidDetails(
            'mailto:example@yourdomain.org',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );

        // 2. Fetch All Subscriptions
        // We use the Service Role key (if available) or Anon key to fetch all users' subs.
        // NOTE: In a high-scale app, you would paginate this query.
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('user_id, subscription');

        if (error) throw error;
        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: 'No subscriptions found' });
        }

        // 3. Send Notifications
        const notificationPayload = JSON.stringify({
            title: '🔥 Mantieni la tua serie!',
            body: 'Non dimenticare di completare la tua sfida giornaliera su Deepsafe!',
            url: '/dashboard'
        });

        // Use Promise.allSettled to ensure one failure doesn't stop the whole batch
        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                webpush.sendNotification(sub.subscription as any, notificationPayload)
                    .catch(async err => {
                        // 410 Gone means the subscription is no longer valid (user unsubscribed or cleared data)
                        // Cleanup expired subscription
                        if (err.statusCode === 410) {
                            // Cleanup expired subscription
                            if (sub.subscription) {
                                await supabase
                                    .from('push_subscriptions')
                                    .delete()
                                    .eq('user_id', sub.user_id)
                                    .eq('subscription', sub.subscription as any);
                            }
                        }
                        throw err;
                    })
            )
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failureCount = results.filter(r => r.status === 'rejected').length;

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failureCount
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
