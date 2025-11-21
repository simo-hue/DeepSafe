import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize Stripe safely
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // apiVersion: '2025-01-27.acacia',
    })
    : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
    if (!stripe || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
        console.error('Missing environment variables for Stripe Webhook');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Initialize Supabase Admin Client (Bypasses RLS)
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const actionType = session.metadata?.actionType;

        if (!userId || !actionType) {
            console.error('Missing metadata in Stripe session');
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        console.log(`Processing ${actionType} for user ${userId}`);

        try {
            switch (actionType) {
                case 'ACTIVATE_PREMIUM':
                    await supabaseAdmin
                        .from('profiles')
                        .update({ is_premium: true })
                        .eq('id', userId);
                    break;

                case 'REFILL_HEARTS':
                    await supabaseAdmin
                        .from('profiles')
                        .update({ current_hearts: 5 })
                        .eq('id', userId);
                    break;

                case 'STREAK_FREEZE':
                    // Ensure the column exists via migration first!
                    await supabaseAdmin
                        .from('profiles')
                        .update({ streak_freeze_active: true } as any) // Cast as any if types aren't updated yet
                        .eq('id', userId);
                    break;

                default:
                    console.warn(`Unknown action type: ${actionType}`);
            }
        } catch (dbError) {
            console.error('Supabase update failed:', dbError);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
