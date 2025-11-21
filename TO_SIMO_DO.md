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