# Guida alla Creazione di Contenuti (Training Modules)

Questa guida spiega come aggiungere nuove lezioni, quiz e sfide alla piattaforma DeepSafe.

## Struttura dei Dati

Tutti i contenuti di formazione sono definiti nel file:
`src/data/quizData.ts`

### 1. Definire una Nuova Lezione

Per aggiungere un nuovo modulo, devi aggiungere un oggetto all'interno di `CONTENT_LIBRARY`.

```typescript
'id-lezione-univoco': {
    id: 'id-lezione-univoco',
    title: 'Titolo della Lezione',
    content: `
# Titolo Principale (Markdown)

Testo della lezione. Puoi usare **grassetto**, *corsivo* e liste.

## Sottotitolo
Altro testo...
    `,
    questions: [
        // Vedi sezione Quiz
    ],
    xpReward: 100, // XP guadagnati al completamento
    estimatedTime: '5 min' // Tempo stimato
}
```

### 2. Aggiungere Domande (Quiz)

Le domande sono un array di oggetti `QuizQuestion`.

```typescript
questions: [
    {
        id: 'q1',
        text: 'Testo della domanda?',
        options: [
            'Opzione A (Indice 0)',
            'Opzione B (Indice 1)',
            'Opzione C (Indice 2)',
            'Opzione D (Indice 3)'
        ],
        correctAnswer: 1, // L'indice della risposta corretta (0-3)
        explanation: 'Spiegazione che appare dopo aver risposto.'
    }
]
```

### 3. Mappare il Contenuto (Geolocalizzazione)

Per far apparire la lezione in una specifica provincia o regione, devi aggiornare le mappe alla fine del file `quizData.ts`.

#### Per una Provincia Specifica
Aggiungi una riga a `PROVINCE_CONTENT_MAP`:

```typescript
const PROVINCE_CONTENT_MAP: Record<string, string> = {
    'MI': 'financial-fraud', // Milano avrà questo contenuto
    'RM': 'id-tua-nuova-lezione', // Roma avrà il tuo nuovo contenuto
};
```

#### Per un'Intera Regione
Aggiungi una riga a `REGION_CONTENT_MAP`:

```typescript
const REGION_CONTENT_MAP: Record<string, string> = {
    'Lombardia': 'industrial-security', // Tutte le province lombarde (tranne quelle specificate sopra)
    'Sicilia': 'id-tua-nuova-lezione',
};
```

### Esempio Completo

```typescript
// 1. Aggiungi la lezione
'sicurezza-navale': {
    id: 'sicurezza-navale',
    title: 'Sicurezza dei Porti',
    content: '# Difesa Navale...',
    questions: [...],
    xpReward: 200,
    estimatedTime: '10 min'
}

// 2. Mappa la regione
const REGION_CONTENT_MAP = {
    'Liguria': 'sicurezza-navale'
};
```

## Formattazione Markdown

Il campo `content` supporta Markdown standard:
- `# Titolo 1`
- `## Titolo 2`
- `**Grassetto**`
- `*Corsivo*`
- `- Lista puntata`
- `1. Lista numerata`

## Best Practices

1.  **ID Univoci**: Assicurati che l'ID della lezione sia unico.
2.  **Brevità**: Le lezioni dovrebbero essere leggibili in 2-3 minuti.
3.  **Feedback**: Fornisci sempre una `explanation` utile per ogni domanda.
4.  **XP**: Bilancia la ricompensa in base alla difficoltà (es. 100 XP facile, 300 XP difficile).
