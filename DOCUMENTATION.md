# Nuova Pagina Missioni (2026-01-15)

## Obiettivo
Creare una pagina dedicata che illustri in modo elegante e coinvolgente il percorso educativo ("roadmap") dell'utente attraverso le regioni e province italiane, ciascuna legata a temi specifici di cybersecurity.

## Implementazione
- **Nuova Pagina**: `src/app/missioni/page.tsx`
    - Layout a griglia responsive.
    - Card interattive per ogni Regione (clic per espandere).
    - Visualizzazione delle Province e delle Missioni specifiche (es. "Il Sovraccarico Dati" a Campobasso).
    - Utilizzo di `framer-motion` per animazioni fluide.
- **Dati Dinamici**:
    - Importazione diretta da `src/data/missions_dataset.json`.
    - Mapping intelligente delle icone basato sui "topic" delle missioni (es. 💰 per Finance, 🦠 per Malware).
- **Navbar**:
    - Aggiunto link "MISSIONI" nel menu principale (Desktop e Mobile) tra "CHI SIAMO" e "PREZZI".

## Skill Tree (2026-01-15)
- **Pagina**: `src/app/skill-tree/page.tsx`
- **Descrizione**: Visualizzazione interattiva ad albero delle competenze acquisibili.
- **Tech**: SVG per le connessioni, Framer Motion per le animazioni, JSON dataset per la struttura (`src/data/skills_dataset.json`).
- **Features**:
    - Zoom-in animation all'ingresso.
    - Hover effects sui nodi.
    - Side-panel dettagliato al click su un nodo.
    - Responsive layout (coordinate percentuali).

## Design
- Stile "DeepSafe Dark": Background scuro (`#0a0a12`), accenti Neon Cyan (`#00f3ff`).
- Hero Section suggestiva con gradiente radiale.
- Card con effetto hover e bordo luminoso.

# Shop Updates (2025-12-24)

## Price Rebalancing
- **Reduced Prices**:
    - Small Pack (500 NC): €1.99 (was €4.99)
    - Medium Pack (1200 NC): €3.99 (was €9.99)
    - Large Pack (2500 NC): €7.99 (was €19.99)
- **Frontend**: Updated `src/app/shop/page.tsx` to display the new prices.
- **Backend Setup**: Updated `TO_SIMO_DO.md` with instructions to create these new products in Stripe.

## Previous Fixes
- **Mystery Box Cost**: Fixed the mystery box logic to correctly deduct 150 NC.

# Website Transformation (2025-12-27)
- **Landing Page Refactor**: Updated `src/app/page.tsx` to serve as the homepage.
    - Removed Waitlist logic.
    - Replaced Countdown.
- **New Site Structure**:
    - **`src/components/site/SiteNavbar.tsx`**: Shared navigation component.
    - **`src/components/site/SiteFooter.tsx`**: Shared footer component.
    - **`/chi-siamo`**: About Us page featuring founders Mattioli & Suarato.
    - **`/prezzi`**: Pricing page with Free, Pro, and Elite tiers.
    - **`/links`**: Resources page.

## Analytics & SEO
- **Google Analytics**: Integrated Tracking ID `G-HJWJBEW0ZS` via `next/script` in `src/app/layout.tsx`.
- **Google Verification**: Added Google Site Verification tag `8qmREYvq02YN2lDjMscR2l6ysUa6ZfMPd3nHhzsA29k`.

## Feedback System (2025-12-27)
- **Incentive**: Added visualization of "1 Month Free PRO" reward for constructive feedback.
- **UI Changes**:
    - **Profile Page**: Added teaser text below the "Send Feedback" button.
    - **Feedback Modal**: Added a "Special Reward" banner with details.

# Admin Panel Updates (2026-01-07)
- **User Email Display**: Replaced User ID with Email in the Admin Panel user list.
- **Secure API**: Implemented `/api/admin/users` to securely fetch email addresses from `auth.users` using the Service Role.
- **Search**: Enhanced search functionality to support searching by email address.

# Shop Price Optimization (2026-01-14)
## Coin Pack Rebalancing
- **Obiettivo**: Rendere le monete più convenienti e fornire vantaggi effettivi agli utenti.
- **Modifiche ai Prezzi**:
    - **Starter Pack**: 1000 NC a €0.99 (era 500 NC a €1.99) - **+100% monete, -50% prezzo**
    - **Pacchetto POPOLARE**: 2500 NC a €1.49 (era 1200 NC a €3.99) - **Bonus +68%**
    - **Pacchetto MIGLIOR VALORE**: 6000 NC a €3.99 (era 2500 NC a €7.99) - **Bonus +50%**
- **File Modificato**: `src/app/shop/page.tsx` (righe 323-360)
- **Verifica Build**: ✅ Compilato con successo, 34 pagine generate correttamente
- **Note**: I prezzi Stripe dovranno essere aggiornati separatamente nel dashboard quando la funzionalità sarà attivata.

## Mystery Box Price Increase
- **Obiettivo**: Rendere la Cassa Crittografata più speciale e meno facilmente ottenibile.
- **Modifica**: Prezzo aumentato da **150 NC a 500 NC** (+233%)
- **File Modificati**: 
    - `src/app/shop/page.tsx` (righe 230, 407)
    - `src/lib/supabase/02_mystery_box_fix.sql` (righe 18, 71)
- **Script SQL**: Creato `sql_updates/update_mystery_box_price.sql` per aggiornare il database esistente
- **Verifica Build**: ✅ Compilato con successo

# Email Notifica Regalo (2026-01-14)

## Obiettivo
Implementare l'invio automatico di email quando viene inviato un regalo agli utenti dal pannello admin, per notificarli immediatamente e invitarli a controllare l'app.

## Implementazione

### Backend - Database
- **Migration SQL**: `supabase/migrations/20250114_add_gift_email_notification.sql`
  - Abilita l'estensione `pg_net` per chiamate HTTP da PostgreSQL
  - Crea la funzione `send_gift_notification_email()` che:
    - Recupera l'email dell'utente da `auth.users`
    - Recupera il username da `profiles`
    - Costruisce un'email HTML professionale con template personalizzato
    - Invia l'email tramite Resend API usando `pg_net.http_post()`
    - Gestisce gli errori senza bloccare l'invio del regalo
  - Modifica la funzione `send_gift()` per chiamare automaticamente `send_gift_notification_email()`
  - Aggiunge la colonna `icon_url` alla tabella `gifts` se non esiste

### Email Template
Template HTML professionale con:
- **Design**: Stile dark mode coerente con l'identità DeepSafe
- **Responsive**: Ottimizzato per desktop e mobile
- **Contenuto Dinamico**:
  - Nome utente personalizzato
  - Descrizione del regalo (crediti, vite, avatar)
  - Messaggio personalizzato dai founder
  - CTA button per aprire l'app
- **Branding**: Logo, colori gradient cyan/blue, emoji regalo 🎁

### Servizio Email
- **Provider**: Resend ([resend.com](https://resend.com))
- **Piano**: Gratuito - 3,000 email/mese, 100 email/giorno
- **Invio**: Asincrono tramite `pg_net`, non blocca la creazione del regalo
- **Gestione Errori**: Se l'email fallisce, il regalo viene comunque creato e l'errore viene loggato

### Configurazione Richiesta
1. Creare account su Resend
2. Ottenere API Key da Resend dashboard
3. Configurare la API Key in Supabase:
   ```sql
   ALTER DATABASE postgres SET app.settings.resend_api_key = 're_YOUR_API_KEY';
   SELECT pg_reload_conf();
   ```
4. Eseguire la migration `20250114_add_gift_email_notification.sql`

### File Correlati
- **Migration**: `supabase/migrations/20250114_add_gift_email_notification.sql`
- **Guida Setup**: `RESEND_SETUP_GUIDE.md` - Guida dettagliata per configurare Resend
- **Componente Admin**: `src/components/admin/GiftModal.tsx` (nessuna modifica richiesta)
- **Funzione Regalo**: Modificata `send_gift()` in PostgreSQL

### Funzionalità
- ✅ Invio automatico email quando un admin invia un regalo
- ✅ Template HTML professionale e responsive
- ✅ Supporto per tutti i tipi di regalo (crediti, vite, avatar)
- ✅ Invio asincrono (non blocca l'UI)
- ✅ Gestione errori robusta
- ✅ Personalizzazione messaggio per ogni regalo
- ✅ Log degli errori per debugging

### Testing
Per testare l'invio email:
1. Configurare Resend come descritto in `RESEND_SETUP_GUIDE.md`
2. Accedere al pannello admin (`/admin`)
3. Selezionare un utente (preferibilmente il proprio account)
4. Inviare un regalo qualsiasi
5. Verificare la ricezione dell'email
6. Controllare i log Resend per conferma invio

### Note Tecniche
- Le email sono inviate **dopo** la creazione del regalo nel database
- Se l'utente non ha email, viene loggato un WARNING ma il regalo viene creato
- L'invio email usa `PERFORM` (non `SELECT`) per esecuzione asincrona
- La API key è configurata a livello database per sicurezza
- Il template email supporta personalizzazione completa del messaggio

# Sistema Multi-Casse Crittografate (2026-01-15)

## Obiettivo
Implementare 3 livelli di rarità per le casse crittografate nello shop, con prezzi diversi e probabilità variabili di ottenere ricompense migliori.

## Sistema Implementato

### 3 Tipologie di Casse
1. **Cassa Crittografata Base** (🎁)
   - **Prezzo**: 300 NC (ridotto dalla vecchia cassa singola a 500 NC)
   - **Probabilità**: Alta per ricompense comuni, bassa per ricompense rare

2. **Cassa Crittografata Rara** (💎)
   - **Prezzo**: 800 NC
   - **Probabilità**: Equilibrata tra ricompense comuni e rare
   - **Badge**: "POPOLARE"

3. **Cassa Crittografata Leggendaria** (⭐)
   - **Prezzo**: 2000 NC
   - **Probabilità**: Alta per ricompense rare ed epiche
   - **Badge**: "MIGLIORE VALORE"
   - **Effetto**: Glow dorato animato

### Pool di Ricompense
Tutte le casse condividono lo stesso pool di ricompense, ma con probabilità diverse:
- **Avatar Recluta** (Common) - ID: `avatar_rookie`
- **Avatar Cyber Ninja** (Rare) - ID: `avatar_ninja`
- **Avatar Elite Hacker** (Epic) - ID: `avatar_hacker`
- **Avatar Architetto** (Legendary) - ID: `avatar_architect`
- **100 NeuroCredits**
- **500 NeuroCredits**

### Distribuzione Probabilità (Pesi)

#### Cassa Base
- avatar_rookie: 50 (molto comune)
- credits 100: 60 (molto comune)
- avatar_ninja: 15 (raro)
- avatar_hacker: 5 (molto raro)
- credits 500: 5 (molto raro)
- avatar_architect: 1 (leggendario)

#### Cassa Rara
- avatar_rookie: 30 (comune)
- credits 100: 30 (comune)
- avatar_ninja: 40 (frequente)
- avatar_hacker: 20 (raro)
- credits 500: 15 (raro)
- avatar_architect: 5 (leggendario)

#### Cassa Leggendaria
- avatar_rookie: 10 (raro)
- credits 100: 10 (raro)
- avatar_ninja: 30 (frequente)
- avatar_hacker: 40 (molto frequente)
- credits 500: 30 (molto frequente)
- avatar_architect: 20 (frequente)

## Modifiche Database

### Migration SQL
- **File**: `supabase/migrations/20250115_add_multiple_mystery_boxes.sql`
- **Azioni**:
  1. Nasconde la vecchia `mystery_box` (mantiene storico, `is_visible = false`)
  2. Crea 3 nuove voci in `shop_items`: `mystery_box_basic`, `mystery_box_rare`, `mystery_box_legendary`
  3. Popola `mystery_box_loot` con loot tables specifiche per ogni cassa (18 righe totali)
  4. Nessuna modifica alla funzione `purchase_item` (già supporta box multipli dinamicamente)

### Tabelle Modificate
- **`shop_items`**: +3 righe nuove, 1 riga nascosta
- **`mystery_box_loot`**: +18 righe (6 per tipo di cassa)

## Modifiche Frontend

### File Modificati
1. **`src/app/shop/page.tsx`**
   - **Rimossa**: Sezione hardcoded per singola cassa (linee 391-412)
   - **Aggiunta**: Sezione dinamica con griglia 3 colonne per le casse
   - **Rimossa**: Funzione `handleMysteryBoxSection()` (obsoleta)
   - **Logica**: Le casse vengono caricate da database, filtrate per `effect_type = 'mystery_box'`, ordinate per costo

### Design UI
Ogni cassa ha stile personalizzato basato sulla rarità:

| Elemento | Base | Rara | Leggendaria |
|----------|------|------|-------------|
| Bordo | `border-purple-500/30` | `border-cyan-500/30` | `border-yellow-500/30` |
| Sfondo | `from-purple-950/20` | `from-cyan-950/20` | `from-yellow-950/20` |
| Bottone | `bg-purple-600` | `bg-cyan-600` | `bg-gradient-to-r from-yellow-600 to-yellow-500` |
| Ombra | Purple glow | Cyan glow | Gold glow + pulse |
| Badge | - | "POPOLARE" (cyan) | "MIGLIORE VALORE" (gold) |

### Responsive Design
- **Desktop**: Griglia a 3 colonne
- **Mobile**: Griglia a 1 colonna (stack verticale)
- **Hover**: Effetto scale-up leggero su desktop

## Funzionalità Mantenute
- ✅ Modal di decrittazione con animazioni
- ✅ Sistema di probabilità con pesi (weighted random)
- ✅ Gestione duplicati avatar (rimborso 50 NC)
- ✅ Feedback visivo durante acquisto
- ✅ Verifica crediti insufficienti
- ✅ Auth guard per utenti non loggati

## Testing Consigliato
1. **Database**: Verificare creazione corretta delle 3 casse e loot tables in Supabase
2. **UI**: Testare visualizzazione responsive su desktop e mobile
3. **Funzionale**: Acquistare ogni tipo di cassa e verificare distribuzione ricompense
4. **Edge Cases**: Testare con crediti insufficienti, avatar duplicati

## Note Tecniche
- Il sistema usa **weighted random selection**: somma dei pesi → numero random → scansione cumulativa
- La funzione `purchase_item` è generica e funziona con qualsiasi `box_id`
- La vecchia cassa resta nel database per non rompere gli storico acquisti precedenti
- I prezzi sono facilmente modificabili dalla tabella `shop_items` senza toccare il codice

## File Coinvolti
- ✅ `supabase/migrations/20250115_add_multiple_mystery_boxes.sql` (NEW)
- ✅ `src/app/shop/page.tsx` (MODIFIED)
- ✅ `TO_SIMO_DO.md` (UPDATED)
- ✅ `DOCUMENTATION.md` (UPDATED)

# Fix Persistenza Loot Table Shop Manager (2026-01-15)

## Problema
Nel pannello amministratore dello shop (`/admin/shop`), quando si configurava la loot table di una Cassa Crittografata usando il pulsante "CONFIGURE LOOT TABLE", i dati sembravano salvarsi correttamente ma dopo un refresh della pagina tutte le configurazioni venivano perse.

## Causa Radice
Il bug era nel componente `LootManagerModal.tsx` alla linea 24. Il problema riguardava la sincronizzazione dello stato locale del modal con i dati passati dal componente padre:

```typescript
// PRIMA (BUGGY)
const [loot, setLoot] = useState<LootItem[]>(initialLoot);
```

Il problema è che `useState` inizializza lo stato solo al **primo render del componente**. Quando il modal veniva riaperto dopo aver caricato i dati dal database, lo stato locale non si aggiornava con i nuovi dati passati tramite la prop `initialLoot`.

**Flusso del bug**:
1. ✅ Utente apre item mystery box esistente
2. ✅ Parent component carica loot dal database (`mystery_box_loot`)
3. ✅ Utente clicca "CONFIGURE LOOT TABLE"
4. ❌ Modal si apre con lo stato locale STALE (vecchi dati)
5. ✅ Utente modifica/aggiunge loot, clicca "SAVE CONFIGURATION"
6. ✅ Modal chiama `onSave(loot)` che aggiorna il parent
7. ✅ Parent salva correttamente in database via `handleSave()`
8. ❌ Al refresh: dati caricati dal DB OK, ma modal non sincronizza lo stato locale

## Soluzione Implementata

Aggiunto un `useEffect` hook per sincronizzare lo stato locale del modal ogni volta che:
- La prop `initialLoot` cambia (nuovi dati dal database)
- Il modal viene aperto (`isOpen` diventa `true`)

```typescript
// DOPO (FIXED)
import React, { useState, useEffect } from 'react';

// ...

useEffect(() => {
    if (isOpen) {
        setLoot(initialLoot);
    }
}, [initialLoot, isOpen]);
```

Questo garantisce che ogni volta che il modal si apre, lo stato locale viene aggiornato con i dati più recenti caricati dal database.

## File Modificati

### `src/components/admin/shop/LootManagerModal.tsx`
- **Linea 1**: Aggiunto import di `useEffect` da React
- **Linee 31-36**: Aggiunto `useEffect` hook per sincronizzazione stato

```diff
- import React, { useState } from 'react';
+ import React, { useState, useEffect } from 'react';

  export function LootManagerModal({ isOpen, onClose, boxId, initialLoot, onSave }: LootManagerModalProps) {
      const [loot, setLoot] = useState<LootItem[]>(initialLoot);
      // ...
      
+     // Sync local state with initialLoot prop when it changes or modal opens
+     useEffect(() => {
+         if (isOpen) {
+             setLoot(initialLoot);
+         }
+     }, [initialLoot, isOpen]);
```

## Funzionalità Ripristinate
- ✅ Configurazione loot table persiste dopo salvataggio
- ✅ Dati vengono correttamente caricati dal database al refresh
- ✅ Modal mostra sempre i dati aggiornati quando viene aperto
- ✅ Modifica loot esistenti funziona correttamente
- ✅ Aggiunta/rimozione item nel loot manager funziona come previsto

## Testing
Per verificare la fix:
1. Aprire `/admin/shop`
2. Modificare un mystery box esistente o crearne uno nuovo con `effect_type = 'mystery_box'`
3. Cliccare "CONFIGURE LOOT TABLE"
4. Aggiungere 2-3 ricompense con pesi e descrizioni diverse
5. Cliccare "SAVE CONFIGURATION" → "SAVE ITEM"
6. Refreshare la pagina (F5 o Cmd+R)
7. Riaprire lo stesso item e cliccare "CONFIGURE LOOT TABLE"
8. **Risultato Atteso**: Tutte le ricompense configurate sono visibili
9. **Risultato Prima del Fix**: Loot table era vuota

## Impatto
- **Complessità**: Bassa (aggiunta di 6 righe di codice)
- **Rischio**: Minimo (fix standard di React state sync)
- **Ambito**: Solo `LootManagerModal` component
- **Breaking Changes**: Nessuno

---

# Sistema Codici Invito con Abbonamento PRO (2026-01-15)

## Obiettivo
Implementare un sistema di referral dove gli utenti possono invitare amici tramite codici invito personali e guadagnare mesi di abbonamento PRO gratuito. Ogni invito con successo (amico che si iscrive e riscatta il codice) fa guadagnare 1 mese PRO, fino a un massimo di 12 mesi (1 anno).

## Funzionalità Implementate

### 1. Codici Invito Personali
- Ogni utente ha un codice invito univoco di 6 caratteri alfanumerici (es: `ABC123`)
- Il codice viene generato automaticamente alla registrazione
- Gli utenti possono condividere il loro codice tramite:
  - **Copia negli appunti**: Button "Copia" con feedback visivo
  - **Condivisione nativa**: Button "Condividi" che usa Web Share API su mobile

### 2. Sistema di Ricompense Referral
- **Referrer (chi invita)**: 
  - +10 cuori (cap massimo a 5)
  - +1 mese PRO guadagnato
- **Nuovo utente (chi riscatta)**:
  - +10 cuori (cap massimo a 5)
- **Nessun bonus XP** (rimosso rispetto al sistema precedente)

### 3. Tracciamento Referral
- Tabella `referrals` che registra:
  - ID del referrer
  - ID dell'utente invitato
  - Codice invito utilizzato
  - Data dell'invito
- Constraint di unicità: un utente può essere invitato una sola volta
- Limite massimo: 12 referral per utente

### 4. Abbonamento PRO
- **Mesi Guadagnati**: Campo `pro_months_earned` in profiles (0-12)
- **Attivazione Manuale**: L'utente decide quando attivare il PRO tramite pulsante
- **Scadenza Automatica**: Campo `pro_expires_at` calcolato come `activation_date + (months_earned * 1 month)`
- **Tracking Attivazione**: Campo `pro_activated_at` per sapere quando l'utente ha attivato

### 5. UI/UX nel Profilo

#### Sezione "Invita Amici" (`InviteCodeCard`)
- Design cyber-themed con effetti glow
- Display del codice invito in formato grande e chiaro
- Pulsanti "Copia" e "Condividi" con animazioni
- Informazioni: "Massimo 12 inviti = 1 anno PRO"

#### Sezione "Status PRO" (`ProStatusCard`)
- **Badge "PRO ATTIVO"**: Visibile solo se abbonamento attivo
- **Progress bar**: Visualizza mesi guadagnati (X/12) con segmenti
- **Stats Grid**:
  - Amici invitati (X/12)
  - Data di scadenza PRO
- **Pulsante "ATTIVA PRO"**: 
  - Visibile solo se `pro_months_earned > 0` e PRO non attivo
  - Glow animato dorato
  - Mostra numero di mesi da attivare
- **Lista Referral**: Ultimi 5 inviti con username e data

## Modifiche Database

### Migration SQL
**File**: `supabase/migrations/20250115_invite_code_system.sql`

#### Nuove Tabelle
```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY,
    referrer_id UUID REFERENCES profiles(id),
    referred_user_id UUID REFERENCES profiles(id),
    referral_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referrer_id, referred_user_id),
    CHECK (referrer_id != referred_user_id)
);
```

#### Nuovi Campi in `profiles`
- `pro_months_earned INTEGER` - Mesi PRO guadagnati (0-12)
- `pro_expires_at TIMESTAMPTZ` - Data di scadenza abbonamento PRO
- `pro_activated_at TIMESTAMPTZ` - Data di attivazione PRO

#### Nuove Funzioni RPC

##### `redeem_code(code TEXT)` - AGGIORNATA
Riscatta un codice invito:
- Verifica validità del codice
- Impedisce auto-riscatto
- Verifica che utente non abbia già riscattato un codice
- Verifica limite 12 referral per referrer
- Crea record in `referrals`
- Dà +10 cuori a entrambi (cap a 5)
- Incrementa `pro_months_earned` del referrer

**Returns**: JSON `{ success: boolean, message: string }`

##### `get_referral_stats()` - NUOVA
Ottiene statistiche referral dell'utente:
```json
{
  "referral_count": 3,
  "pro_months_earned": 3,
  "is_pro_active": true,
  "pro_expires_at": "2026-04-15T10:00:00Z",
  "pro_activated_at": "2026-01-15T10:00:00Z",
  "referrals": [
    {
      "referred_user_id": "uuid",
      "username": "amico1",
      "created_at": "2026-01-10T..."
    }
  ]
}
```

##### `activate_pro_subscription()` - NUOVA
Attiva manualmente l'abbonamento PRO:
- Verifica che `pro_months_earned > 0`
- Verifica che PRO non sia già attivo
- Calcola `pro_expires_at`
- Imposta `is_premium = true`
- Registra `pro_activated_at`

**Returns**: JSON `{ success: boolean, message: string, expires_at?: string, months_activated?: number }`

##### `check_pro_expiration()` - NUOVA
Verifica e disattiva abbonamenti PRO scaduti:
- Esegue `UPDATE` per impostare `is_premium = false` dove `pro_expires_at < NOW()`
- Da chiamare periodicamente (es: al login o tramite cron job)

## Modifiche Frontend

### File TypeScript
**`src/types/supabase.ts`**
- Aggiornato tipo `profiles.Row` con nuovi campi Pro
- Aggiunta tabella `referrals` con relazioni
- Aggiunti tipi per nuove funzioni RPC

### Componenti Creati

#### `InviteCodeCard.tsx`
**Props**: `{ referralCode: string }`

**Features**:
- Copia codice negli appunti con feedback visivo (icona Check)
- Condivisione nativa (Web Share API o fallback a copia)
- Design cyber con scanner line e glow effects
- Responsive

**Location**: `src/components/profile/InviteCodeCard.tsx`

#### `ProStatusCard.tsx`
**Props**: `{ onProActivated?: () => void }`

**Features**:
- Carica statistiche via `get_referral_stats()`
- Progress bar animata con segmenti
- Badge Pro ATTIVO con animazione scale
- Pulsante attivazione Pro con glow dorato
- Lista referral con scroll custom
- Modal di successo/errore via `useSystemUI`

**Location**: `src/components/profile/ProStatusCard.tsx`

### Integrazione Profilo
**File**: `src/app/profile/page.tsx`

**Posizione**: Dopo `MedagliereSection`, prima di `StatisticsSection`

```tsx
{/* Section A.6: Invite Friends */}
{profile?.referral_code && (
    <InviteCodeCard referralCode={profile.referral_code} />
)}

{/* Section A.7: PRO Status & Referrals */}
<ProStatusCard onProActivated={() => refreshProfile()} />
```

## Testing

### Test Manuale Consigliati

1. **Generazione Codice**: Verificare che ogni utente abbia un codice referral univoco
2. **Copia Codice**: Testare funzionalità copia su desktop e mobile
3. **Condivisione**: Testare Web Share API su mobile
4. **Riscatto Codice**: Verificare validazione e ricompense
5. **Attivazione PRO**: Testare flow completo di attivazione
6. **Scadenza PRO**: Testare con date manuali la funzione di scadenza
7. **Limite 12 Referral**: Verificare che dopo 12 inviti non si possa più invitare

### Query SQL Utili

```sql
-- Vedere tutti i referral attivi
SELECT 
    p1.username as referrer,
    p2.username as referred,
    r.created_at,
    p1.pro_months_earned
FROM referrals r
JOIN profiles p1 ON r.referrer_id = p1.id
JOIN profiles p2 ON r.referred_user_id = p2.id
ORDER BY r.created_at DESC;

-- Utenti con PRO attivo
SELECT username, pro_months_earned, pro_expires_at, is_premium
FROM profiles
WHERE is_premium = true;

-- Top referrers
SELECT p.username, COUNT(r.id) as invites, p.pro_months_earned
FROM profiles p
LEFT JOIN referrals r ON r.referrer_id = p.id
GROUP BY p.id
ORDER BY invites DESC
LIMIT 10;
```

## Limitazioni Conosciute

### UI per Riscatto Codice Non Implementata
Al momento non c'è un'interfaccia utente per inserire il codice invito dopo la registrazione. La funzione RPC `redeem_code` funziona, ma serve implementare:
- **Opzione 1**: Modale al primo login
- **Opzione 2**: Sezione nel profilo "Hai un codice invito?"
- **Opzione 3**: Pagina dedicata `/redeem`

Attualmente il codice può essere riscattato solo manualmente via SQL:
```sql
SELECT redeem_code('ABC123');
```

### Scadenza PRO Non Automatica
La funzione `check_pro_expiration()` esiste ma deve essere chiamata:
- Manualmente via SQL Editor
- Al login dell'utente (richiede integrazione futura)
- Tramite Supabase Edge Function schedulata (cron job)

## File Coinvolti

### Database
- ✅ `supabase/migrations/20250115_invite_code_system.sql` (NEW)

### TypeScript Types
- ✅ `src/types/supabase.ts` (MODIFIED)

### Components
- ✅ `src/components/profile/InviteCodeCard.tsx` (NEW)
- ✅ `src/components/profile/ProStatusCard.tsx` (NEW)
- ✅ `src/app/profile/page.tsx` (MODIFIED)

### Documentation
- ✅ `TO_SIMO_DO.md` (UPDATED) - Azioni manuali richieste
- ✅ `DOCUMENTATION.md` (UPDATED) - Questa documentazione
- ✅ `task.md` (ARTIFACT) - Checklist implementazione
- ✅ `implementation_plan.md` (ARTIFACT) - Piano tecnico dettagliato

## Note Tecniche

### Sicurezza
- Le funzioni RPC usano `SECURITY DEFINER` per eseguire con privilegi database
- Row Level Security (RLS) attiva su tabella `referrals`
- Gli utenti possono vedere solo i propri referral

### Performance
- Indici creati su `referrals(referrer_id)`, `referrals(referred_user_id)`, `referrals(created_at)`
- Indice su `profiles(pro_expires_at)` per query di scadenza efficienti

### Scalabilità
- Il sistema supporta teoricamente referral illimitati per il deployment
- Il limite di 12 per utente è configurabile tramite CHECK constraint
- La funzione `get_referral_stats()` ritorna max 5 referral recenti (lista troncata)

## Prossimi Passi (TODO)

1. **UI Riscatto Codice**: Implementare interfaccia per inserire codice invito
2. **Scadenza Automatica**: Schedulare `check_pro_expiration()` con Supabase Edge Function
3. **Email Notifiche**: Inviare email quando si guadagna un mese PRO
4. **Analytics**: Tracciare metriche referral con PostHog
5. **A/B Testing**: Testare diversi incentivi (10 vs 15 cuori, 1 vs 2 mesi PRO)

---

# Integrazione Feedback con Sistema PRO (2026-01-15)

## Obiettivo
Integrare il sistema di feedback esistente con il nuovo sistema di abbonamento PRO, premiando automaticamente gli utenti che inviano il primo feedback con 1 mese PRO gratuito.

## Implementazione

### Database Migration
**File**: `supabase/migrations/20250115_feedback_pro_reward.sql`

#### Nuovi Campi

##### Tabella `feedback`
- `pro_reward_given BOOLEAN` - Indica se questo feedback ha assegnato un mese PRO

##### Tabella `profiles`
- `has_submitted_feedback BOOLEAN` - Traccia se l'utente ha inviato almeno un feedback

#### Trigger Automatico
Creato trigger `trigger_reward_pro_for_feedback` che:
- Si attiva **prima** dell'inserimento in tabella `feedback`
- Verifica se è il primo feedback dell'utente
- Controlla che l'utente non abbia già 12 mesi PRO
- Incrementa `pro_months_earned` di +1
- Imposta `has_submitted_feedback = true`
- Marca `pro_reward_given = true` sul record feedback

**Logica del Trigger**:
```sql
CREATE OR REPLACE FUNCTION reward_pro_for_feedback()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = NEW.user_id 
        AND has_submitted_feedback = TRUE
    ) THEN
        UPDATE profiles
        SET 
            pro_months_earned = LEAST(12, COALESCE(pro_months_earned, 0) + 1),
            has_submitted_feedback = TRUE
        WHERE id = NEW.user_id
        AND COALESCE(pro_months_earned, 0) < 12;
        
        NEW.pro_reward_given := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Frontend Changes

#### TypeScript Types
**File**: `src/types/supabase.ts`

- Aggiunto `has_submitted_feedback: boolean | null` a `profiles.Row/Insert/Update`
- Aggiunto `pro_reward_given: boolean | null` a `feedback.Row`

#### FeedbackModal Component
**File**: `src/components/profile/FeedbackModal.tsx`

**Modifiche**:
1. Aggiunta prop `onFeedbackSubmitted?: () => void`
2. Invocazione callback dopo successo invio feedback:
```typescript
setSuccess(true);

// Refresh Pro status to reflect new Pro month earned
onFeedbackSubmitted?.();

setTimeout(() => { /* ... */ }, 2000);
```

#### Profile Page Integration
**File**: `src/app/profile/page.tsx`

```typescript
<FeedbackModal
    isOpen={isFeedbackOpen}
    onClose={() => setIsFeedbackOpen(false)}
    userId={user.id}
    onFeedbackSubmitted={() => refreshProfile()} // ← NUOVO
/>
```

### Flusso Utente

1. **Utente invia primo feedback** via FeedbackModal
2. **Trigger database** incrementa `pro_months_earned` (se < 12)
3. **Callback** `onFeedbackSubmitted()` chiama `refreshProfile()`
4. **ProStatusCard** si aggiorna automaticamente mostrando +1 mese
5. **Modal "Feedback Inviato"** appare per 2 secondi
6. **Utente vede** il nuovo counter aggiornato (es. da 2/12 a 3/12)

## Benefici

✅ **Automatico**: Nessun intervento manuale admin richiesto  
✅ **Tracciabile**: Campo `pro_reward_given` permette audit  
✅ **Equo**: Solo il primo feedback viene ricompensato (no spam)  
✅ **Limitato**: Rispetta il cap di 12 mesi massimo  
✅ **Real-time**: Il counter si aggiorna immediatamente  

## Testing

### Test Manuale

1. Login con account di test
2. Verificare `pro_months_earned` attuale (es. tramite ProStatusCard)
3. Andare in profilo → "Invia Feedback"
4. Compilare e inviare un feedback (tipo + messaggio)
5. Attendere chiusura modale (2 secondi)
6. Verificare che ProStatusCard mostri +1 mese
7. Aprire di nuovo feedback modal e inviare altro feedback
8. Verificare che il counter **NON** aumenti (solo primo feedback)

### Query SQL di Verifica

```sql
-- Vedere utenti che hanno ricevuto Pro da feedback
SELECT 
    p.username,
    p.pro_months_earned,
    p.has_submitted_feedback,
    COUNT(f.id) as total_feedback,
    SUM(CASE WHEN f.pro_reward_given THEN 1 ELSE 0 END) as rewarded_feedback
FROM profiles p
LEFT JOIN feedback f ON f.user_id = p.id
WHERE p.has_submitted_feedback = true
GROUP BY p.id
ORDER BY p.pro_months_earned DESC;

-- Vedere tutti i feedback che hanno dato ricompensa
SELECT 
    f.id,
    p.username,
    f.type,
    f.message,
    f.pro_reward_given,
    f.created_at
FROM feedback f
JOIN profiles p ON p.id = f.user_id
WHERE f.pro_reward_given = true
ORDER BY f.created_at DESC;
```

## Note Tecniche

### Perché BEFORE Trigger?
Il trigger usa `BEFORE INSERT` invece di `AFTER INSERT` perché:
- Può modificare `NEW.pro_reward_given` prima del salvataggio
- Più performante (single transaction)
- Garantisce atomicità

### Backfill
La migration **non assegna retroattivamente** Pro months agli utenti che hanno già inviato feedback. Marca solo `has_submitted_feedback = true` per evitare doppi premi futuri.

Per assegnare retroattivamente (se necessario):
```sql
UPDATE profiles
SET pro_months_earned = LEAST(12, COALESCE(pro_months_earned, 0) + 1)
WHERE has_submitted_feedback = true
AND COALESCE(pro_months_earned, 0) < 12;
```

### Sicurezza
- Trigger usa `SECURITY DEFINER` per eseguire con privilegi database
- RLS policies già attive su tabella `feedback`
- Gli utenti possono vedere solo i propri feedback

## File Modificati

### Database
- ✅ `supabase/migrations/20250115_feedback_pro_reward.sql` (NEW)

### TypeScript Types
- ✅ `src/types/supabase.ts` (MODIFIED)

### Components
- ✅ `src/components/profile/FeedbackModal.tsx` (MODIFIED)
- ✅ `src/app/profile/page.tsx` (MODIFIED)

### Documentation
- ✅ `DOCUMENTATION.md` (UPDATED) - Questa documentazione

---

# UI Inserimento Codice Invito Durante Registrazione (2026-01-15)

## Obiettivo
Implementare un campo "Codice Amico" nel form di registrazione per permettere ai nuovi utenti di inserire il codice referral di chi li ha invitati, riscattandolo automaticamente all'iscrizione.

## Implementazione

### Frontend Changes

#### Login/Signup Page
**File**: `src/app/login/page.tsx`

**Modifiche**:

1. **Nuovo State**:
```typescript
const [referralCode, setReferralCode] = useState(''); // Codice amico
```

2. **Nuovo Campo Input** (visibile solo in modalità signup):
```tsx
<div className="relative group">
    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
    <input
        type="text"
        placeholder="Codice Amico (Opzionale)"
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
        maxLength={6}
        className="w-full bg-[#1F2833] border border-amber-500/20 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 outline-none transition-all font-mono text-sm uppercase"
        disabled={loading}
    />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-amber-500/60 font-mono">
        +10 ❤️
    </div>
</div>
```

**Design Features**:
- ✅ Border color ambra per distinguerlo dagli altri campi
- ✅ Icona Shield (scudo) a sinistra
- ✅ Badge "+10 ❤️" a destra come incentivo visivo
- ✅ Auto-conversione a maiuscolo
- ✅ Limite di 6 caratteri
- ✅ Completamente opzionale

3. **Auto-Redemption Logic**:
```typescript
if (isSignUp) {
    const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ''}/auth/callback`,
            data: {
                username: username,
                referral_code: referralCode || null // Salvato in user metadata
            }
        },
    });
    if (error) throw error;
    
    // Auto-redeem if code was provided
    if (referralCode && referralCode.trim() !== '' && authData.user) {
        try {
            const { data: redeemData } = await supabase.rpc('redeem_code', { 
                code: referralCode.toUpperCase().trim() 
            });
            
            const result = redeemData as { success: boolean; message: string };
            if (result && result.success) {
                console.log('Referral code redeemed successfully:', result.message);
            } else {
                console.warn('Referral code redemption failed:', result?.message);
            }
        } catch (redeemError) {
            // Non-blocking: registrazione procede comunque
            console.error('Error redeeming referral code:', redeemError);
        }
    }
    
    setShowConfirmationModal(true);
}
```

**Logica**:
- Il codice viene salvato nei metadati utente (`user.user_metadata.referral_code`)
- Dopo signup, se il codice è presente, chiama automaticamente `redeem_code()`
- **Non-bloccante**: Se il riscatto fallisce, la registrazione procede comunque
- Logging in console per debug

## Flusso Utente Completo

1. **Nuovo utente visita `/login`**
2. Clicca "**REGISTRATI**"
3. Compila:
   - Username
   - **Codice Amico** (opzionale) ← **NUOVO**
   - Email
   - Password
4. Clicca "**REGISTRA IDENTITÀ**"
5. Il sistema:
   - Crea account
   - **Se codice presente**: Chiama `redeem_code()`
     - ✅ Referrer riceve +10 cuori e +1 mese PRO
     - ✅ Nuovo utente riceve +10 cuori
   - Mostra modale "Controlla la tua email"
6. Utente conferma email e può effettuare login

## Vantaggi

✅ **UX Fluida**: Un solo form, nessun passaggio extra  
✅ **Incentivo Visivo**: "+10 ❤️" mostra subito il beneficio  
✅ **Opzionale**: Non obbligatorio, non blocca la registrazione  
✅ **Error-Tolerant**: Codice invalido non impedisce signup  
✅ **Auto-Capitalizzazione**: Converte automaticamente in maiuscolo  
✅ **Distinguibile**: Colore ambra diverso dagli altri campi  

## Testing

### Test Manuale

1. **Registrazione con codice valido**:
   - Vai su `/login` → "REGISTRATI"
   - Inserisci un codice valido di un altro utente
   - Completa registrazione
   - Verifica console: "Referral code redeemed successfully"
   - Controlla database: entrambi hanno +10 cuori, referrer ha +1 mese PRO

2. **Registrazione con codice invalido**:
   - Inserisci "INVALID"
   - Completa registrazione
   - Verifica console: "Referral code redemption failed"
   - **Registrazione procede comunque** ✅

3. **Registrazione senza codice**:
   - Lascia campo vuoto
   - Completa registrazione
   - Nessun errore, registrazione normale

4. **Codice proprio** (edge case):
   - Utente A prova a usare il proprio codice
   - Sistema ritorna errore "Cannot redeem your own code"
   - Registrazione procede comunque

### Query SQL Verifica

```sql
-- Vedere referral con codice riscattato
SELECT 
    p.username as nuovo_utente,
    p.created_at,
    r.referral_code,
    pr.username as referrer
FROM profiles p
LEFT JOIN referrals r ON r.referred_user_id = p.id
LEFT JOIN profiles pr ON pr.id = r.referrer_id
WHERE r.id IS NOT NULL
ORDER BY p.created_at DESC;

-- User metadata con codice referral
SELECT 
    id,
    email,
    raw_user_meta_data->>'username' as username,
    raw_user_meta_data->>'referral_code' as referral_code_used,
    created_at
FROM auth.users
WHERE raw_user_meta_data->>'referral_code' IS NOT NULL
ORDER BY created_at DESC;
```

## Risoluzione Limitazione Precedente

Questa implementazione risolve la limitazione documentata in `implementation_plan.md`:

> **Limitazione**: UI per Riscatto Codice Non Implementata
> 
> ~~Al momento non c'è un'interfaccia utente per inserire il codice invito dopo la registrazione.~~

✅ **RISOLTO**: Il codice può ora essere inserito **durante** la registrazione, rendendo il flusso più fluido.

## Note Tecniche

### User Metadata
Il codice referral viene salvato in `auth.users.raw_user_meta_data`:
```json
{
  "username": "newuser",
  "referral_code": "ABC123"
}
```

Questo permette:
- Audit trail completo
- Possibile recupero in caso di errori
- Debugging facilitato

### Non-Blocking Design
La chiamata `redeem_code()` è wrappata in try/catch:
- ✅ Se succede: bonus assegnati
- ❌ Se fallisce: solo log, registrazione OK
- Questo previene che codici invalidi blocchino nuove registrazioni

### Sicurezza
- Validazione lato client (6 char, uppercase)
- Validazione lato server (in `redeem_code` RPC)
- Rate limiting Supabase apply
- RLS policies attive

## File Modificati

### Frontend
- ✅ `src/app/login/page.tsx` (MODIFIED) - Aggiunto campo input e logica auto-redeem

### Documentation
- ✅ `TO_SIMO_DO.md` (UPDATED) - Rimossa nota "Da Implementare"
- ✅ `DOCUMENTATION.md` (UPDATED) - Questa documentazione

---

# Sistema Auto-Check Scadenza PRO (2026-01-15)

## Obiettivo
Garantire che gli abbonamenti PRO scaduti vengano disattivati tempestivamente, mantenendo lo stato consistente sia per gli utenti attivi (controllo immediato) che per quelli inattivi (pulizia periodica).

## Architettura Implementata "Belt and Suspenders"

### 1. Lazy Check (Controllo all'Accesso)
Ogni volta che si accedono alle statistiche di referral (tramite `ProStatusCard` nel profilo), il sistema esegue un controllo mirato per l'utente corrente **prima** di restituire i dati.

- **Trigger**: Chiamata RPC `get_referral_stats()`
- **Azione**: Se `pro_expires_at < NOW()`, imposta `is_premium = false`
- **Vantaggio**: Garanzia 100% che l'utente veda lo stato corretto nell'interfaccia, senza race conditions col cron job.

### 2. Scheduled Job (Controllo Background)
Un job pianificato tramite `pg_cron` esegue una pulizia globale ogni notte.

- **Schedule**: Ogni giorno a mezzanotte (UTC)
- **Funzione**: `check_pro_expiration()` (controlla tutti gli utenti)
- **Vantaggio**: Mantiene il database pulito anche per utenti che non effettuano login da tempo.

## Dettagli Tecnici

### Migration SQL
**File**: `supabase/migrations/20260115_schedule_pro_check.sql`

1. **Abilitazione pg_cron**: `CREATE EXTENSION IF NOT EXISTS pg_cron`
2. **Scheduling**:
   ```sql
   SELECT cron.schedule('daily_pro_check', '0 0 * * *', $$SELECT check_pro_expiration()$$);
   ```
3. **Update RPC**: Aggiornata `get_referral_stats` per includere la logica lazy check.

### Logica Lazy Check
```sql
UPDATE profiles
SET is_premium = false
WHERE id = auth.uid()
AND is_premium = true
AND pro_expires_at < NOW();
```
Eseguita all'inizio della funzione per atomicità (nella stessa transazione della lettura successiva).

## Verifica e Testing
Vedi `TO_SIMO_DO.md` per istruzioni dettagliate su come verificare manualmente l'attivazione del cron job e testare il lazy check modificando manualmente le date di scadenza.

## Note
- Richiede l'estensione `pg_cron` abilitata nel progetto Supabase.
- Il lazy check funge da fallback robusto nel caso il cron job fallisca o sia disabilitato.



---

# Admin Referral Analytics (2026-01-15)

## Obiettivo
Fornire agli amministratori una visione d'insieme chiara e immediata delle performance del sistema di referral, inclusi grafici di crescita e classifiche degli utenti più attivi.

## Implementazione

### Backend
**File**: `supabase/migrations/20260115_admin_referral_analytics.sql`
- **RPC**: `get_admin_referral_stats`
- **Dati restituiti**:
    - `total_referrals`: Conteggio totale inviti.
    - `total_pro_months_distributed`: Somma totale mesi PRO guadagnati.
    - `top_referrers`: Array top 10 utenti per numero inviti.
    - `daily_growth`: Array ultimi 30 giorni (data, conteggio inviti).

### Frontend
**File**: `src/app/admin/referrals/page.tsx`
- **Libreria Grafici**: `recharts`
- **Componenti**:
    - **KPI Cards**: Totale inviti, Mesi PRO distribuiti, Top Referrer.
    - **Line Chart**: Crescita giornaliera ultimi 30gg.
    - **Bar Chart**: Top 5 referrers.
    - **Table**: Leaderboard dettagliata.

## Accesso
Accessibile dalla Dashboard Admin principale tramite il pulsante "REFERRALS".

# Feedback Widget Non-Intrusivo (2026-01-15)

## Obiettivo
Implementare un meccanismo di feedback leggero e non intrusivo per raccogliere l'opinione degli utenti ("Ti piace DeepSafe?") senza interrompere la loro esperienza.

## Implementazione

### Componenti UI
- **`src/components/ui/FeedbackWidget.tsx`**: Un componente toast personalizzato che appare in basso a destra.
    - **Stati**: Iniziale (pollice su/giù), Positivo (invito alla recensione), Negativo (campo testo), Grazie.
    - **Logica di Apparizione**: 
        - Appare dopo 10 secondi.
        - **Persistenza**: Se l'utente chiude, non ricompare per 7 giorni. Se dà feedback, non ricompare per 30 giorni.
    - **Integrazione Dati**: Salva direttamente nella tabella `feedback` di Supabase.

### Integrazione Globale
- Inserito in **`src/components/layout/LayoutWrapper.tsx`** per essere visibile in tutta l'applicazione (eccetto landing page e admin).

### Backend
- Utilizza la tabella esistente `feedback` su Supabase via client-side insert.
- **Payload**: `user_id`, `type` ('like'/'dislike'), `message`, `device_info`.

## Come Testare
1. Ricaricare la dashboard e attendere 10 secondi.
2. Interagire con il widget (Pollice Su o Giù).
3. Verificare che il feedback venga salvato nel database.
4. Chiudere il widget e ricaricare per verificare che non riappaia immediatamente (cooldown).

# Aggiornamento Prezzi e Shop (2026-01-15)

## Obiettivo
Aumentare la percezione del valore dell'abbonamento PRO e incentivare il feedback e i referral, mostrando i costi reali dei piani di abbonamento direttamente nello shop.

## Modifiche

### 1. Pagina Prezzi (`/prezzi`)
- Aggiornati i prezzi per riflettere le nuove tier:
    - **PRO**: €1.99 / mese (era €4.99)
    - **ELITE (Premium)**: €4.99 / mese (era €9.99)

### 2. Shop (`/shop`)
- Aggiunta nuova sezione **"Abbonamenti"** in cima alla pagina.
- Banner visivi per i piani:
    - **PRO (€1.99)**: Stile "Cyber Blue", etichetta "POPOLARE".
    - **ELITE (€4.99)**: Stile "Purple/Gold", etichetta "ELITE".
- **Funzionamento**: I banner sono puramente visivi (ancore di prezzo) e cliccando portano alla pagina `/prezzi` per i dettagli.

## Refinement (2026-01-15, v2)
- **Semplificazione UI**: Rimossi descrizioni e pulsanti dai banner Shop.
- **Header**: Aggiunta intestazione "ABBONAMENTI" con icona Corona.
- **Headers Extra**: Aggiunte intestazioni "MONETE" e "POTENZIAMENTI" per una migliore organizzazione.
- **Focus**: Design minimale centrato su Nome, Prezzo e Icona per massimo impatto visivo.

# Revisione Missioni Completate (2026-01-15)

## Obiettivo
Permettere agli utenti di cliccare sulle missioni già completate (status verde) per rivedere le domande e le risposte, invece di disabilitare l'interazione.

## Implementazione

### Frontend
**File**: `src/components/dashboard/ProvinceModal.tsx`
- **Rimozione Blocco**: Rimossa la logica `disabled={isPassed}` dai pulsanti delle missioni.
- **UX Update**: 
    - Cambiato il cursore da `not-allowed` a `pointer`.
    - Aggiunto effetto hover per indicare interattività.
    - Cambiato il testo del pulsante da "COMPLETATA" a "RIVEDI DOMANDE" quando lo stato è `isPassed`.
- **Navigazione**: Il click ora reindirizza sempre alla pagina di training (`/training`), permettendo di rileggere la lezione e i quiz.

## Testing
1. Aprire una provincia completata (verde).
2. Verificare che il pulsante "MISSIONE COMPLETATA" sia cliccabile.
3. Cliccare e verificare che si apra la pagina della missione correttamente.


# Fix Conteggio Barra Superiore (2026-01-15)

## Obiettivo
Correggere il conteggio mostrato nella barra superiore della dashboard (mappa Italia). In precedenza mostrava il numero totale di missioni (es. 0/1000+), che risultava confuso. L'obiettivo è mostrare il numero di **Province Completate** su Totale Province (es. 5/107).

## Implementazione

### Modifiche Frontend
- **File**: `src/components/dashboard/ItalyMapDashboard.tsx`
- **Modifica**: Aggiornato il componente `<TopBar />` per passare esplicitamente le props `progress` e `total`.
- **Valori**:
    - `progress`: `completedCount` (numero di province completate calcolato localmente)
    - `total`: `totalProvinces` (lunghezza dell'array `dynamicProvincesData`)

```tsx
// Prima
<TopBar />

// Dopo
<TopBar progress={completedCount} total={totalProvinces} />
```

### Risultato
La barra ora mostra correttamente il progresso basato sulle province (es. "5/107") invece che sulle missioni, allineandosi col contesto della mappa regionale.

# Ottimizzazione Responsività UI (2026-01-15)

## Obiettivo
Ridurre i tempi di attesa percepiti durante la navigazione nella mappa (zoom ingresso regione e reset vista Italia), rendendo l'interfaccia più scattante.

## Modifiche
- **`ItalyMapSVG.tsx`**: Ridotta la durata della transizione `framer-motion` da 0.8s a **0.4s**.
- **`ItalyMapDashboard.tsx`**: Ridotta la durata dell'animazione di reset (`resetTransform`) da 1000ms a **500ms**.

## Risultato
L'ingresso nelle regioni e il ritorno alla vista nazionale sono ora due volte più veloci, migliorando notevolmente l'esperienza utente.

# Centramento e Scala Regioni (2026-01-15)

## Obiettivo
Migliorare la visualizzazione delle singole regioni, che risultavano troppo zoomate (grandi) e non perfettamente centrate (spostate in basso).

## Modifiche
- **`src/components/dashboard/ItalyMapDashboard.tsx`**:
    - Aumentato il padding del ViewBox regionale dal 20% al **60%** (`0.6`). Questo riduce lo zoom effettivo rendendo la regione più piccola e leggibile.
    - Aggiunto lo stesso offset verticale (**15%**) usato per la mappa nazionale, per spostare la regione verso l'alto.

## Risultato
Le regioni ora appaiono più distanziate dai bordi e centrate verticalmente in modo coerente con la mappa nazionale.

# Centramento Mappa Italia (2026-01-15)

## Obiettivo
Correggere il posizionamento della mappa dell'Italia nella dashboard, che risultava leggermente spostata verso il basso, lasciando un gap vuoto in alto.

## Modifiche
- **`src/components/dashboard/ItalyMapDashboard.tsx`**: Aggiunto un offset verticale positivo (`yOffset`) al calcolo del `viewBox` iniziale. Questo sposta l'area visibile verso il basso, con l'effetto visivo di spostare la mappa verso l'alto e centrarla meglio nello schermo.
- Valore offset: circa 15% dell'altezza totale del bounding box.

## Risultato
La mappa appare ora perfettamente centrata verticalmente all'apertura dell'app.

# Leaderboard Rewards (2026-01-15)

## Obiettivo
Premiare automaticamente gli utenti più attivi (classificati al 1° posto nella classifica Globale) con monete NeuroCredits (NC) alla fine di ogni settimana e mese.

## Funzionalità
1.  **Premio Settimanale**:
    - **Importo**: 1000 NC
    - **Criterio**: 1° Classificato Globale (Rubini > Smeraldi > Crediti)
    - **Schedulazione**: Ogni Lunedì alle 00:00 UTC
2.  **Premio Mensile**:
    - **Importo**: 5000 NC
    - **Criterio**: 1° Classificato Globale
    - **Schedulazione**: Il 1° di ogni mese alle 00:00 UTC
3.  **Notifica In-App**:
    - Modale celebrativa con coriandoli al login successivo.
    - Aggiornamento immediato del saldo.

## Implementazione Tecnica

### Database (Supabase)
- **Nuova Tabella**: `user_notifications` per tracciare le assegnazioni.
- **Funzione SQL**: `process_leaderboard_rewards(period TEXT)` calcola il vincitore e assegna i crediti.
- **Scheduling**: Job `pg_cron` configurati per invocare la funzione automaticamente.

### Frontend
- **Hook**: `useRewardNotifications` controlla le notifiche non lette.
- **Componente**: `RewardNotificationModal` visualizza la vittoria con animazioni.
- **Integrazione**: Aggiunto in `ItalyMapDashboard` per visibilità immediata.

## Testing Manuale
Vedi `TO_SIMO_DO.md` sezione 13 per i comandi SQL di simulazione.

# Homepage Style Refresh (2026-01-15)

## Obiettivo
Allineare lo stile della homepage (`/`) con le pagine più recenti come `/prezzi` e `/chi-siamo`, eliminando CSS legacy e standardizzando l'header.

## Modifiche
- **`src/app/page.tsx`**:
    - **Removed**: Legacy CSS import (`landing/css/shared.css`, `landing/css/theme.css`).
    - **Refactored**: Sostituito il wrapper `theme-youth` con classi Tailwind standard (`min-h-screen`, `bg-[#0a0a12]`, `font-['Outfit']`).
    - **Updated**: Aggiornati i pulsanti per usare classi Tailwind esplicite invece della classe legacy `.btn`.
    - **Header**: Assicurata la coerenza dell'uso di `SiteNavbar`.

## Risultato
La homepage ora condivide lo stesso look & feel "Dark Cyber" delle altre sezioni pubbliche del sito, con una navigazione coerente e senza dipendenze CSS esterne obsolete.


# Fix Next.js Build & Configuration (2026-01-15)

## Problema
- **Errore Build**: Falliva a causa di import Deno-specifi in `supabase/functions` intercettati dal compilatore TypeScript di Next.js.
- **Errore Parsing JSON**: `tsconfig.json` riportava errori di sintassi (mancanza di virgole o struttura corrotta).
- **Dipendenze Obsolete**: Warning su `baseline-browser-mapping` vecchio.

## Soluzione
1. **Aggiornamento `tsconfig.json`**:
   - Ricreato il file da zero per garantire integrità sintattica.
   - Aggiunta esclusione esplicita per `./supabase` nel campo logic `exclude`.
   
2. **Aggiornamento Dipendenze**:
   - Eseguito `npm i baseline-browser-mapping@latest -D`.

## Verifica
- **Comando**: `npm run build`
- **Risultato**: ✅ Build completata con successo.

# Blog Post Update (2026-01-19)
- **Content**: Updated `content/english/blog/tech-project/DeepSafe/index.md` on the blog repository.
- **Details**:
    - Replaced placeholder content with DeepSafe specific details (Gamified AI Safety, Italy Map, Shop, Tech Stack).
    - Updated tech stack references to Next.js 16, React 19, Supabase, Tailwind v4.
    - Added correct links to live demo and documentation.

# Fix User Notifications RLS (2026-01-29)

## Problema
Supabase Linter segnalava "RLS Disabled in Public" per la tabella `public.user_notifications`. Questo rappresenta un rischio di sicurezza poiché la tabella era accessibile pubblicamente senza restrizioni a livello di riga.

## Soluzione
Creata migration `supabase/migrations/20260129211320_fix_user_notifications_rls.sql` che:
1.  **Abilita RLS**: `ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;`
2.  **Policy SELECT**: "Users can view their own notifications" (solo `auth.uid() = user_id`).
3.  **Policy UPDATE**: "Users can update their own notifications" (permette di modificare `read`, ecc.).
4.  **Policy DELETE**: "Users can delete their own notifications".

## Verifica

# Security Hardening (2026-01-29)

## Fix Supabase Linter Warnings
Per migliorare la sicurezza del database e conformarsi alle best practice di Supabase, sono state apportate le seguenti modifiche:

1.  **Fixed Search Path Mutable**:
    - Tutte le funzioni `SECURITY DEFINER` verificate ora hanno un `search_path` esplicito (`public, extensions, pg_temp`).
    - Alcune funzioni segnalate dal linter (`admin_reset_user`, `admin_update_profile_v2`, `admin_update_user_stats`, `complete_level_v2/v3`) **non** sono incluse nella migration perché non trovate nel codebase corrente (probabilmente versioni obsolete).
    - File migration: `supabase/migrations/20260129213000_fix_security_warnings.sql`.

2.  **Extension in Public**:
    - **Nota**: L'estensione `pg_net` **non** è stata spostata nellon schema `extensions` poiché PostgreSQL non supporta `ALTER EXTENSION ... SET SCHEMA` per questa estensione specifica senza ricrearla.
    - Il warning "Extension in Public" persisterà per `pg_net`. Questo è accettato per evitare perdita di dati o disservizi (code email pendenti).
    - Tuttavia, `extensions` è stato aggiunto al `search_path` delle funzioni come best practice per il futuro.

## Auth Configuration
- Si raccomanda di abilitare "Leaked Password Protection" nella dashboard di Supabase Auth per prevenire l'uso di password compromesse.


- [2026-08-08]: Entity/GEO — canonical home moved to simo-hue.github.io/DeepSafe, fabricated rating removed, JSON-LD made crawlable
  - *Details*: Part of the personal-entity SEO/GEO programme (see `simo-hue.github.io/SEO_AUDIT/README.md`). Five defects were live. (1) `metadataBase` and `og:url` pointed at `https://deepsafe.app`, which does not respond over HTTPS — every resolved image URL and social preview targeted a dead host. (2) The `SoftwareApplication` JSON-LD declared `aggregateRating` 4.8 from 1250 ratings with no reviews anywhere on the site; unverifiable ratings breach Google's review-snippet policy and are a documented cause of site-wide manual actions. (3) The graph was rendered through `next/script`, so it only existed after JavaScript ran — GPTBot, ClaudeBot, CCBot and PerplexityBot do not execute JS, making it invisible to precisely the crawlers it was written for. (4) `<html lang="en">` on an entirely Italian site whose `og:locale` is already `it_IT`. (5) `<meta name="author" content="DeepSafe Team">` credited nobody.
  - *Tech Notes*: Fast-forwarded this fork 84 commits from `deep-safe/DeepSafe` (clean FF, 0 ahead) so the canonical URL serves current code. Introduced a single `SITE_URL` constant (`https://simo-hue.github.io/DeepSafe`) driving `metadataBase`, `alternates.canonical` (previously absent entirely) and `openGraph.url`. Because the upstream repo builds from this same constant, both Pages sites will declare the same canonical once redeployed — that is the cross-canonical fix for the duplicate-content situation, deliberately chosen over taking a site offline so no inbound link 404s. Replaced the bare `SoftwareApplication` with an `@graph`: `SoftwareApplication` (`#app`) + `Organization` (`#organization`, `founder` → the canonical Person) + a `Person` reference to `https://simo-hue.github.io/#person`, the one node every property in the estate points at. Switched `<Script id="json-ld">` to a plain `<script>` in this Server Component. `og:image` pointed at `/landing/assets/og-youth.jpg`, which **does not exist in the repo and 404s on both deployed sites** — repointed to `/landing/assets/logo.png` (618×646, which resolves) with the declared dimensions corrected to match; a proper 1200×630 preview is still outstanding. **Verified** with a production build using `NEXT_PUBLIC_BASE_PATH=/DeepSafe`: canonical `https://simo-hue.github.io/DeepSafe/`, `og:url` and `og:image` on the live host, `html lang="it"`, author `Simone Mattioli`, 0 occurrences of `deepsafe.app`, 0 of `ratingValue`, 1 raw `application/ld+json` tag in the static HTML (previously 0), and the graph parses with `founder` → `https://simo-hue.github.io/#person`.
