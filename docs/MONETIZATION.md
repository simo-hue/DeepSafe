# 💰 Monetization & Shop

Deepsafe employs a hybrid monetization model: **Freemium + Ads**. This ensures accessibility while providing a sustainable revenue model.

## 💳 Stripe Integration

We use **Stripe Checkout** for secure, PCI-compliant payments.

### Products
You must create these products in your Stripe Dashboard and add their Price IDs to the code/env.

1.  **Deepsafe Elite (Subscription)**
    - **Price**: €4.99 / Month
    - **Type**: Recurring
    - **Perks**: Infinite Lives, No Ads, Double XP.
    - **Code ID**: `price_elite_monthly_id`

2.  **System Reboot (Consumable)**
    - **Price**: €0.99
    - **Type**: One-time
    - **Effect**: Refills Hearts to 5 immediately.
    - **Code ID**: `price_reboot_id`

3.  **Streak Freeze (Consumable)**
    - **Price**: €1.99
    - **Type**: One-time
    - **Effect**: Protects streak for one missed day.
    - **Code ID**: `price_streak_freeze_id`

### Webhook Logic
The backend listens for `checkout.session.completed` events at `/api/webhooks/stripe`.
- **Security**: Verifies the `stripe-signature` header.
- **Metadata**: The checkout session includes `userId` and `actionType` metadata.
- **Fulfillment**:
    - `ACTIVATE_PREMIUM`: Updates `profiles.is_premium = true`.
    - `REFILL_HEARTS`: Updates `profiles.current_hearts = 5`.
    - `STREAK_FREEZE`: Updates `profiles.streak_freeze_active = true`.

## 📺 Ads Simulation

Since this is a PWA/Web demo, we simulate "Rewarded Video Ads".

1.  **User Action**: Clicks "Watch Ad (Free)" in the Shop.
2.  **Client-Side**:
    - Opens a modal that cannot be closed easily.
    - Runs a 15-second countdown timer.
    - Shows "Incoming Transmission" visuals.
3.  **Server-Side**:
    - Upon timer completion, the client calls `/api/ad-reward`.
    - The server verifies the request (rate-limiting would be added here in prod).
    - The server increments `profiles.current_hearts` by 1.
