Le Immagini: Il codice userà dei "placeholder" (immagini finte). Il tuo compito umano sarà cercare su Google o generare con Midjourney/DALL-E 5-10 coppie di immagini (una vera e una generata) e incollare i link nel file JSON creato.

Esempio: Cerca "Pope in puffer jacket" (AI) vs "Pope Francis photo" (Real).

Testa il Feedback: Verifica che quando sbagli la risposta "Visuale", l'app ti spieghi perché (es. "Guarda lo sfondo sfocato in modo innaturale"). Questo è il cuore educativo del tuo documento.


---


⚠️ Cosa devi fare TU manualmente (Checklist Imprenditore)

Mentre l'AI scrive il codice, tu devi preparare il terreno "burocratico" su Stripe per rendere le formule concrete:


Crea Account Stripe: Vai su Stripe.com e registrati (è gratis finché non vendi).

Crea i Prodotti: Nella dashboard Stripe, vai su "Prodotti" e crea:

Nome: Deepsafe Elite | Prezzo: 4.99€ (Ricorrente/Mensile). -> Copia il "Price ID" (inizia con price_...).

Nome: System Reboot | Prezzo: 0.99€ (Una tantum). -> Copia il Price ID.

Nome: Streak Freeze | Prezzo: 1.99€ (Una tantum). -> Copia il Price ID.

Variabili d'Ambiente: Una volta che avrai i codici dall'AI, dovrai incollarli nel file .env.local insieme alle chiavi di Stripe (Secret Key e Publishable Key).

---

### 📊 Analytics Setup (PostHog)

Per attivare il tracciamento degli utenti (Analytics):

1.  **Registrati**: Vai su [PostHog.com](https://posthog.com) e crea un account gratuito.
2.  **Crea Progetto**: Crea un nuovo progetto (seleziona "Web" o "Next.js" se chiesto).
3.  **Copia le Chiavi**: Nelle impostazioni del progetto, trova:
    *   `Project API Key`
    *   `Instance Address` (es. `https://us.i.posthog.com` o `https://eu.i.posthog.com`)
4.  **Aggiorna .env.local**: Aggiungi queste righe al tuo file `.env.local`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_INCOLLA_QUI_LA_TUA_CHIAVE
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```
*(Sostituisci `phc_...` con la tua chiave reale e l'host corretto se diverso)*

---

### 🔔 Push Notifications Setup

Per attivare le notifiche push:

1.  **VAPID Keys**: Aggiungi queste chiavi al tuo file `.env.local`:
```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BM0eDPMc_d0Wa52e0qXIXZwbO6Hmopb7yF1uPzm8rdi_FM3T_6siw3I0QmGIHyRgKlRU5Y_UMyO7mpIwHfgK3c8
VAPID_PRIVATE_KEY=oixHmzYAEZ0xyEhq1k1djsN-lEEj64UPVzdH9d38N4A
```

2.  **Database**: Vai nella dashboard di Supabase -> SQL Editor.
### 3. Run Migration for Province Scores
Run the SQL in `supabase_add_province_scores.sql` to add the `province_scores` column.

### 4. Run Migration for Badges
Run the SQL in `supabase_add_badges.sql` to add the `earned_badges` column.

### 5. Run Migration for Friends
Run the SQL in `supabase_add_friends.sql` to create the `friends` table.

### 6. Run Migration for Shop
Run the SQL in `supabase_add_shop.sql` to add `credits`, `streak_freezes`, and `inventory` columns.

### 7. Run Migration for Admin Panel
Run the SQL in `supabase_add_admin.sql` to add the `is_admin` column and RLS policies.

### 8. Enable God Mode (Admin)
1.  Go to Supabase -> Table Editor -> `profiles`.
2.  Find your user row.
3.  Set `is_admin` to `TRUE`.
4.  Click "Save".
    *   Apri il file `supabase_push_setup.sql` (che ho creato nel progetto) o copia il suo contenuto.
    *   Esegui lo script per creare la tabella `push_subscriptions`.

---

### ⏰ Daily Reminder Automation

Per attivare il promemoria giornaliero automatico:

1.  **CRON_SECRET**: Genera una stringa casuale (es. `openssl rand -hex 32`) e aggiungila a `.env.local`:
```bash
CRON_SECRET=tua_stringa_segreta_super_lunga
```

2.  **Supabase Cron**:
    *   Vai su Supabase -> SQL Editor.
    *   Apri il file `supabase_cron_setup.sql`.
    *   **IMPORTANTE**: Modifica `YOUR_APP_URL` con l'URL del tuo sito (es. `https://tuo-progetto.vercel.app`) e `YOUR_CRON_SECRET` con la chiave generata sopra.
    *   Esegui lo script per schedulare il job.

Important: The sound files are currently pointing to placeholders (e.g., /sounds/click.mp3). You need to add the actual .mp3 files to the public/sounds/ folder for them to work.

Stripe Integration Complete! 💳

I have finished the implementation of the Stripe payment system.

What's Done:

Shop UI: Added a "Buy Credits" section with 3 tiers (Small, Medium, Large).
Checkout Flow: Connected the buttons to the Stripe Checkout API.
Webhook Logic: Implemented the BUY_CREDITS handler to safely increment user credits using the new RPC function.
Redirect Handling: The Shop page now detects successful payments and refreshes the user's profile.
Next Steps (Manual): Please follow the Stripe Setup instructions I added to TO_SIMO_DO.md to:

Create your Stripe account.
Get your API Keys.
Create the 3 Credit Pack products.
Configure the Webhook.
Once configured, you can test purchasing credits in Stripe Test Mode! 🚀
    
### 🛡️ Checkout Security Update
    
I have secured the checkout flow to prevent price manipulation. You **MUST** ensure your `.env.local` file has the correct Price IDs for the credit packs:
    
```bash
NEXT_PUBLIC_STRIPE_PRICE_SMALL=price_... (ID for 500 NC)
NEXT_PUBLIC_STRIPE_PRICE_MEDIUM=price_... (ID for 1200 NC)
NEXT_PUBLIC_STRIPE_PRICE_LARGE=price_... (ID for 2500 NC)
```
    
If these are missing or incorrect, payments will fail with an "Invalid Price ID" error.
