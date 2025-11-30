# 🛡️ Deepsafe: Gamified AI Safety

![Status](https://img.shields.io/badge/Status-MVP-success)
![Stack](https://img.shields.io/badge/Stack-Next.js_14_|_Supabase_|_Stripe-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

**Deepsafe** is a progressive web application (PWA) designed to make AI Safety education engaging, accessible, and rewarding. By combining the addictive mechanics of modern mobile games (Duolingo-style) with critical cybersecurity curriculum, we turn learning into a "Cyber-Guardian" adventure.

## 🚀 The Mission

To democratize AI safety knowledge through gamification. We believe that learning how to protect yourself from Deepfakes, Phishing, and Prompt Injection shouldn't be boring—it should feel like leveling up a character in a sci-fi RPG.

## ✨ Key Features

- **🇮🇹 Italy Map Campaign**: A non-linear visual journey through 20 regions and 107 provinces.
- **🎨 Cyber-Guardian UI**: A premium, glassmorphism-based aesthetic with neon accents and smooth animations.
- **❤️ Lives & Streaks**: Classic retention mechanics. Lose a heart for wrong answers; keep your streak alive to earn bonuses.
- **🛒 Black Market**: A fully integrated Shop with NeuroCredits (NC), Mystery Boxes, and Stripe payments.
- **📱 PWA Native Feel**: Installable on iOS and Android with offline capabilities and native-like navigation.

## 🚀 Recent Updates (Gamification & Persistence)

- **Daily Streak System**: Tracks consecutive logins with a visual "Fire" reward modal. Syncs with Supabase to prevent data loss.
- **Province Mastery**: Map provinces now glow Gold (Perfect) or Cyan (Passed) based on your quiz performance.
- **Dynamic Training**: Content is dynamically loaded based on the selected province (e.g., Milan = Financial Fraud).
- **Tactical HUD**: A new "Scanner" interface for selecting and entering regions/provinces.
- **Admin Panel**: "God Mode" for managing users, missions, and shop items.

## 🛠️ Tech Stack

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- A **Supabase** project
- A **Stripe** account (for monetization)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/simo-hue/DeepSafe.git
    cd deepsafe
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add the following keys:
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_for_webhooks

    # Stripe
    STRIPE_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to start your journey.

5.  **Run the Landing Page**
    To run the static landing page:
    ```bash
    cd "LANDING PAGE"
    python3 -m http.server 8000
    ```
    Open [http://localhost:8000](http://localhost:8000) to view the landing page.

## 📚 Documentation Index

Explore the detailed documentation to understand the system:

- **[🧩 Architecture & Database](docs/ARCHITECTURE.md)**: Deep dive into the tech stack, folder structure, and Supabase schema.
- **[🎮 Game Mechanics](docs/GAME_MECHANICS.md)**: How the core loop, Italy Map, and Shop economy work.
- **[💰 Monetization & Shop](docs/MONETIZATION.md)**: Setting up Stripe products, webhooks, and ad rewards.
- **[🚀 Deployment (VPS)](docs/VPS.md)**: Server requirements and deployment guide.
- **[📝 Content Contribution](docs/CONTRIBUTING.md)**: Guide for adding new quizzes and levels to the game.

---
*Built with 💙 by the Deepsafe Team*
