### Test 5: Scadenza PRO
1. Imposta manualmente una data di scadenza passata:
```sql
UPDATE profiles SET pro_expires_at = '2026-01-01', is_premium = true WHERE id = 'TUO_USER_ID';
```
2. Esegui la funzione di controllo scadenza:
```sql
SELECT check_pro_expiration();
```
3. Verifica che `is_premium` diventi `false`

## 3. Implementare UI per Inserimento Codice Invito (TODO FUTURO)

Al momento gli utenti non possono ancora inserire un codice invito dall'interfaccia. Devi decidere dove implementare questa funzionalità:

**Opzione 1: Modale al primo accesso**
- Mostra una modale dopo la registrazione
- Chiedi "Hai un codice invito?"
- Input field + pulsante "Riscatta"

**Opzione 2: Sezione nel profilo**
- Aggiungi una sezione "Hai un codice invito?" nel profilo
- Visibile solo se l'utente non ha mai riscattato un codice

**Opzione 3: Pagina dedicata**
- Crea `/redeem` page
- Input field centrato + design accattivante

## 4. Monitorare i Referral

Per vedere quanti referral sono stati effettuati:

```sql
-- Conta totale referral
SELECT COUNT(*) FROM referrals;

-- Referral per utente
SELECT 
    p.username,
    COUNT(r.id) as referral_count,
    p.pro_months_earned
FROM profiles p
LEFT JOIN referrals r ON r.referrer_id = p.id
GROUP BY p.id
ORDER BY referral_count DESC;

-- Utenti con PRO attivo tramite referral
SELECT 
    username,
    pro_months_earned,
    pro_activated_at,
    pro_expires_at
FROM profiles
WHERE is_premium = true AND pro_months_earned > 0;
```

## 5. Eventuale Personalizzazione

Se vuoi modificare qualche parametro:

### Cambiare il limite massimo di referral (default: 12)
Modifica la migration SQL alla linea del CHECK constraint:
```sql
ALTER TABLE profiles ADD COLUMN pro_months_earned INTEGER DEFAULT 0 
    CHECK (pro_months_earned >= 0 AND pro_months_earned <= 12);  -- Cambia qui
```

### Cambiare i cuori bonus (default: +10)
Modifica nella funzione `redeem_code`:
```sql
UPDATE profiles SET current_hearts = LEAST(5, current_hearts + 10)  -- Cambia qui
```

### Cambiare i mesi Pro per referral (default: 1 mese)
Modifica nella funzione `redeem_code`:
```sql
UPDATE profiles SET pro_months_earned = LEAST(12, pro_months_earned + 1)  -- Cambia qui
```

---

## 6. Feedback Integration (NUOVO - 2026-01-15)

**Cosa fa**: Esegui anche la migration `20250115_feedback_pro_reward.sql` che integra il sistema feedback con il sistema Pro.

**Risultato**: Quando un utente invia il primo feedback, guadagna automaticamente +1 mese PRO (massimo 12 totali).

### Test after migration:
1. Login con account di test
2. Vai in profilo → "Invia Feedback"
3. Invia un feedback qualsiasi
4. Verifica che ProStatusCard mostri +1 mese guadagnato

### Verifica SQL:
```sql
-- Utenti che hanno ricevuto Pro da feedback
SELECT username, pro_months_earned, has_submitted_feedback
WHERE has_submitted_feedback = true;
```

Monitora analytics referral

## 7. Setup Controllo Automatico Scadenza PRO (NUOVO - 2026-01-15)

Oltre alla logica di business, abbiamo implementato un controllo automatico della scadenza PRO.

### 1. Verifica pg_cron (Manuale)
Vai nella dashboard di Supabase -> Database -> Extensions.
Cerca `pg_cron` e assicurati che sia abilitato. La migration prova ad abilitarlo, ma potrebbe richiedere permessi superiori.
Se la migration fallisce su `CREATE EXTENSION`, abilitalo manualmente dalla dashboard.

### 2. Monitorare Job schedulato
Per verificare che il job sia schedulato correttamente:
```sql
SELECT * FROM cron.job;
```
Dovresti vedere un job chiamato `daily_pro_check`.

### 3. Verifica Lazy Check
Il controllo avviene anche ogni volta che l'utente apre il profilo (`get_referral_stats`).
Per testarlo, imposta una data di scadenza nel passato e ricarica il profilo: è immediato.

## 8. Verifica Revisione Missioni (2026-01-15)

Dopo aver ricaricato l'applicazione:
1. Apri una provincia che hai già completato.
2. Clicca sul pulsante "RIVEDI DOMANDE" (ex "COMPLETATA").
3. Verifica che ti porti alla schermata della missione per poter rileggere il contenuto.

## 9. Verifica Conteggio Barra Superiore (2026-01-15)

1. Apri la dashboard (Mappa Italia).
2. Osserva la barra in alto.
3. Verifica che il conteggio mostri "X/107" (dove X è il n. di province completate) e non un numero altissimo come 1000+.

## 10. Verifica Responsività Mappa (2026-01-15)

1. Clicca su una regione qualsiasi.
2. Nota che lo zoom è ora più rapido (0.4s).
3. Clicca su "TORNA ALL'ITALIA".
4. Nota che il reset della vista è più rapido (0.5s).

## 11. Verifica Centramento Mappa (2026-01-15)

1. Ricarica la pagina Dashboard.
2. Verifica che la mappa sia centrata verticalmente e non spostata verso il basso.

## 12. Verifica Scala Regioni (2026-01-15)

1. Clicca su una regione.
2. Verifica che la regione non occupi tutto lo schermo (meno zoom) e sia centrata più in alto.

## 13. Verifica Premi Classifica (Rewards Leaderboard)

Per testare il sistema di premi settimanali/mensili senza aspettare la data effettiva:

1.  **Apri SQL Editor** in Supabase.
2.  **Esegui il Trigger Manuale**:
    ```sql
    -- Simula la fine della settimana (premia il primo in classifica con 1000 NC)
    SELECT process_leaderboard_rewards('weekly');
    ```
3.  **Verifica Frontend**:
    - Vai alla Dashboard (Mappa Italia).
    - Dovrebbe apparire una modale di celebrazione con i coriandoli.
    - Controlla che il saldo NC sia aumentato di 1000.
    
4.  **Simula Premio Mensile**:
    ```sql
    SELECT process_leaderboard_rewards('monthly');
    ```
    - Verifica che arrivi la notifica per 5000 NC.

5.  **Verifica Tabella Notifiche**:
    ```sql
    SELECT * FROM user_notifications ORDER BY created_at DESC;
    ```

## 14. Verifica Layout Homepage (2026-01-15)

1. Apri la homepage (`/`).
2. Verifica che lo stile sia coerente con le pagine `/prezzi` e `/chi-siamo` (background scuro, font Outfit).
3. Controlla che il menù di navigazione (SiteNavbar) appaia e funzioni correttamente.
4. Scorri la pagina per assicurarti che tutte le sezioni siano visibili e ben formattate.
5. Verifica che i pulsanti abbiano uno stile moderno (bordi o sfondi colorati, niente stile legacy).

## 15. Verifica SEO/GEO (2026-01-15)

1. Apri la homepage e controlla il TAG TITLE nel tab del browser: dovrebbe essere "DeepSafe - Impara la Sicurezza Digitale Giocando (Gratis)".
2. Ispeziona elemento (`Cmd+Opt+I`) -> cerca `<meta name="description">` e verifica che contenga "Duolingo della vita digitale".
3. Verifica che nella homepage siano presenti le parole "Competenze Digitali" e il riferimento a imparare "come una lingua".
4. (Opzionale) Copia l'HTML della homepage in un tool di validazione JSON-LD (o Schema Markup Validator) per verificare che `SoftwareApplication` sia corretto.

## 16. Fix Build Error (2026-01-15)

1. Esegui `npm run build` e verifica che non ci siano errori "Parsing ecmascript source code failed".
2. Verifica che la Homepage carichi correttamente tutte le sezioni fino al footer (SiteFooter).
3. Controlla che la lista "Migliora le tue Competenze Digitali" abbia 3 punti elenco e non sia duplicata.

## 17. Verifica Pagina Missioni (2026-01-15)

1. Naviga su `/missioni` dal link nella navbar.
2. Clicca sulle card delle Regioni (es. Molise, Lombardia) per espandere i dettagli.
3. Verifica che le missioni e province siano visibili e corrette.
4. Controlla la responsiveness su mobile.

## 18. Verifica Skill Tree (2026-01-15)
1. Vai su `/skill-tree`.
2. Verifica che l'animazione iniziale e le linee di connessione appaiano corrette.
3. Clicca su un nodo (es. "Cittadino Digitale") e controlla che si apra il pannello laterale.
4. Controlla che le skill siano coerenti con `src/data/skills_dataset.json`.

## 19. Verifica Blog Post (2026-01-19)
1. Avvia il server del blog (`hugo server` in `simo-hue.github.io`).
2. Vai su `/blog/tech-project/deepsafe/`.
3. Controlla che contenuti, link e immagini siano corretti per il progetto DeepSafe.

## 20. Fix RLS User Notifications (2026-01-29)
1. Esegui la migration per abilitare RLS su `user_notifications`:
   ```bash
   npx supabase db push
   ```
   Oppure copia ed esegui manualmente il file `supabase/migrations/20260129211320_fix_user_notifications_rls.sql` nell'SQL Editor di Supabase.

## 21. Fix Security Linter Warnings (2026-01-29)
1. Esegui la migration per fixare i warning del linter (search_path):
   ```bash
   npx supabase db push
   ```
   Oppure esegui `supabase/migrations/20260129213000_fix_security_warnings.sql` nell'SQL Editor.
   *Nota: Il file SQL è stato aggiornato (V7) rimuovendo `drop_constraint_referencing` non presente nel DB. Ora è completamente allineato.*

   > **Attenzione**: Il warning riguardante l'estensione `pg_net` rimarrà perché non è possibile spostarla in un altro schema senza ricrearla (rischio perdita dati).

2. Abilita "Leaked Password Protection":
   - Vai su Supabase Dashboard -> Authentication -> Security.
   - Attiva il toggle "Enable Leaked Password Protection".
## [2026-08-08] DeepSafe — entity/GEO fixes: what you need to do

Local `main` is **84 commits ahead of `origin` (simo-hue/DeepSafe)** after a fast-forward from `deep-safe/DeepSafe`, plus my changes to `src/app/layout.tsx`. Nothing is committed or pushed.

1. **Review and push to `simo-hue/DeepSafe`.** The Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to Pages automatically on push to `main`, and `actions/configure-pages` derives `NEXT_PUBLIC_BASE_PATH=/DeepSafe` by itself — no manual config needed.

2. ⚠️ **Check the Actions secrets on `simo-hue/DeepSafe`.** The build fails with `Error: supabaseUrl is required` without them. This fork last built in Dec 2025, so confirm these exist in Settings → Secrets → Actions:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_DEV_PASSWORD`, `NEXT_PUBLIC_ADMIN_PASSWORD`

3. **Redeploy `deep-safe/DeepSafe` too.** The cross-canonical only works once the upstream copy also rebuilds and starts emitting the `simo-hue` canonical. Merge the same change upstream, or push it there as well.

4. **`deepsafe.app` — you own it, it times out on HTTPS.** Nothing in the code references it any more. Best use now: point it at `https://simo-hue.github.io/DeepSafe/` with a 301 at the registrar, so the domain you're paying for feeds the canonical URL instead of dying quietly.

5. **A real OG image is still missing.** `/landing/assets/og-youth.jpg` never existed in this repo and 404s on both live sites. I repointed to `logo.png` so previews stop breaking, but it's 618×646 — a proper **1200×630** preview would render properly on LinkedIn/X/WhatsApp.

6. **`deploy_gh_pages.sh` is now misleading — consider deleting it.** It predates the Actions workflow and copies `LANDING PAGE/*` over `out/`, overwriting `index.html` with an old static page. If anyone runs it, it clobbers the real site.

## [2026-08-08] 🔴 ROTATE THESE CREDENTIALS — they were published in the client bundle

The code is fixed, but **fixing the code does not un-publish what was already served.** Anyone who
loaded the site could read these out of the JavaScript. Rotate them:

1. **Admin password** (was `NEXT_PUBLIC_ADMIN_PASSWORD`) — change it wherever it is reused.
2. **Dev password** (was `NEXT_PUBLIC_DEV_PASSWORD`) — same.
3. Delete both from **Settings → Secrets → Actions** on `simo-hue/DeepSafe` *and* `deep-safe/DeepSafe`.
   The workflow no longer references them.

**Why they leaked:** both were read in `'use client'` components. Next.js replaces every
`NEXT_PUBLIC_*` reference with its literal value at build time, so they were compiled into the
public JavaScript. A `NEXT_PUBLIC_` prefix means "ship this to the browser" — it can never hold a
secret. Real access control for `/admin` is the Supabase session + `profiles.is_admin` check, which
is still in place and is enforced server-side by row-level security.

**Also check:** confirm row-level security is actually enabled on every table the admin panel
touches. With the password gate gone, RLS is the only thing standing between the anon key and your
data — and the anon key is public by design.

### Lower priority

- **PostHog project key** `phc_rr8SnKrn…` was hardcoded in the `LANDING PAGE/` HTML files. I deleted
  that whole directory (it was orphaned — its only consumer was `deploy_gh_pages.sh`, removed
  earlier). Note this key **predates my changes**: it was committed in `8e2d4a2 landing page`, long
  before today, and has been public in both repos ever since. PostHog `phc_` project keys are
  designed to be public and embedded in client-side pages, so the exposure is low-risk — the worst
  case is someone sending junk events into your project. Rotate only if you care about that.
- The key remains in **git history** in both repos. Rewriting history on a public repo that may
  already be cloned or forked buys little; rotation is the meaningful remediation for anything that
  actually matters.
