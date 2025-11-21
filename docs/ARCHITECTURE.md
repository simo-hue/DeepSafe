# 🧩 Architecture & Database

This document provides a technical deep dive into the **Deepsafe** platform. It covers the technology stack, project structure, and database schema.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) - Server-side rendering and API routes.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS with a custom "Cyber" theme configuration.
- **Database & Auth**: [Supabase](https://supabase.com/) - PostgreSQL database, Authentication, and Storage.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight client-side state (Lives, XP, Streaks).
- **Payments**: [Stripe](https://stripe.com/) - Payment processing for subscriptions and one-time purchases.
- **Icons**: [Lucide React](https://lucide.dev/) - Consistent, clean iconography.

## 📂 Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Backend API Routes (Checkout, Webhooks)
│   ├── dashboard/          # Main Saga Map view
│   ├── profile/            # User Profile, Stats, and Badges
│   ├── quiz/[id]/          # Dynamic Quiz Interface
│   ├── shop/               # Cyber Supply Depot (Monetization)
│   └── page.tsx            # Landing Page
├── components/
│   ├── gamification/       # Game-specific UI (SagaMap, QuizCard, Badges)
│   ├── layout/             # Global layout (BottomNav, Header)
│   └── ui/                 # Reusable atoms (Buttons, Cards)
├── lib/                    # Utilities (cn, formatters)
├── store/                  # Zustand stores (useUserStore)
└── types/                  # TypeScript definitions (Supabase generated)
```

## 🗄️ Database Schema (Supabase)

The application is built on PostgreSQL. Here are the core tables:

### `profiles`
The central user record, linked 1:1 with `auth.users`.
- `id` (UUID): Primary Key.
- `username` (Text): Display name.
- `xp` (Int): Total experience points.
- `current_hearts` (Int): Current lives (Max 5).
- `is_premium` (Bool): "Deepsafe Elite" status.
- `streak_freeze_active` (Bool): Whether a freeze is equipped.
- `highest_streak` (Int): Best daily streak record.

### `levels`
Defines the content hierarchy.
- `id` (UUID): Primary Key.
- `module_id` (UUID): Link to a "Week" or "Chapter".
- `day_number` (Int): Sequential order (e.g., Day 1, Day 2).
- `title` (Text): Level name.
- `is_boss_level` (Bool): If true, triggers special UI/difficulty.
- `xp_reward` (Int): XP gained on completion.

### `user_progress`
Tracks what the user has completed.
- `user_id` (UUID): Link to `profiles`.
- `quiz_id` (UUID): Link to `levels` (or specific quiz).
- `status` (Text): 'locked', 'unlocked', 'completed'.
- `score` (Int): Best score achieved.
- `completed_at` (Timestamp): When it was finished.

### `friendships` & `challenges`
Social features.
- `friendships`: Adjacency list for friends (`user_id`, `friend_id`, `status`).
- `challenges`: PvP records (`challenger_id`, `opponent_id`, `winner_id`).

## 🔐 Security

- **RLS (Row Level Security)**: Enabled on all tables. Users can only read/write their own data. Public data (like Leaderboards) is exposed via specific policies.
- **Middleware**: `middleware.ts` protects private routes (`/dashboard`, `/profile`) and redirects unauthenticated users to `/login`.
- **Secure Webhooks**: Stripe webhooks use the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for administrative updates (e.g., granting Premium status) but verify the Stripe signature to prevent spoofing.
