/*
 * STRIPE SETUP INSTRUCTIONS
 * 
 * 1. Environment Variables (in .env.local):
 *    - STRIPE_SECRET_KEY=sk_test_...
 *    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
 *    - STRIPE_WEBHOOK_SECRET=whsec_...
 *    - NEXT_PUBLIC_BASE_URL=http://localhost:3000 (or your production URL)
 * 
 * 2. Stripe Dashboard Products:
 *    
 *    Product A: "Deepsafe Elite"
 *    - Type: Service (Recurring)
 *    - Price: €4.99 / Month
 *    - ID Needed: price_elite_monthly_id (e.g., price_1Q...)
 * 
 *    Product B: "System Reboot"
 *    - Type: One-time
 *    - Price: €0.99
 *    - ID Needed: price_reboot_id
 * 
 *    Product C: "Streak Freeze"
 *    - Type: One-time
 *    - Price: €1.99
 *    - ID Needed: price_streak_freeze_id
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe safely
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // apiVersion: '2025-01-27.acacia',
    })
    : null;

export async function POST(req: Request) {
    if (!stripe) {
        console.error('Stripe Secret Key is missing');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    try {
        const { priceId, userId, mode, actionType } = await req.json();

        if (!priceId || !userId || !mode || !actionType) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            mode: mode, // 'subscription' or 'payment'
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/shop?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/shop?canceled=true`,
            metadata: {
                userId: userId,
                actionType: actionType, // 'ACTIVATE_PREMIUM', 'REFILL_HEARTS', 'STREAK_FREEZE'
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
