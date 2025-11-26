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

---

### 🗺️ Map Persistence Setup

Per salvare i progressi della mappa nel database:

1.  **Database Update**:
    *   Vai su Supabase -> SQL Editor.
    *   Apri il file `supabase_map_persistence.sql`.
    *   Esegui lo script per aggiungere la colonna `unlocked_provinces` alla tabella `profiles`.