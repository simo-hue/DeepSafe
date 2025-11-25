import { TrainingModule } from '@/components/missions/TrainingPill';

export const trainingData: Record<string, TrainingModule> = {
    // Molise - Campobasso - Mission 1 - Problem 1 (Segnaletica Carente -> now "Sovraccarico Dati" in new dataset but let's map to existing IDs for now)
    // Existing IDs in missionsData.ts are "p1", "p2", "p3" under "m1".
    // I need to be careful about ID uniqueness. In missionsData.ts, problem IDs are "p1", "p2" etc. nested in missions.
    // I should probably construct a unique ID like `${missionId}_${problemId}`.

    "m1_p1": {
        id: "m1_p1",
        title: "Digital Wellbeing: Notifiche",
        briefing: {
            text: "Il sovraccarico cognitivo è spesso causato da un eccesso di notifiche push. Il cervello impiega fino a 23 minuti per ritrovare la concentrazione dopo un'interruzione.",
            keyPoints: [
                "Disattiva le notifiche non essenziali.",
                "Usa la modalità 'Non Disturbare' durante il lavoro profondo.",
                "Pianifica momenti specifici per controllare le email."
            ]
        },
        quiz: {
            question: "Qual è la strategia migliore per ridurre le distrazioni digitali?",
            options: [
                { id: "a", text: "Tenere il telefono sempre acceso sulla scrivania", isCorrect: false },
                { id: "b", text: "Disattivare le notifiche push per le app non critiche", isCorrect: true },
                { id: "c", text: "Controllare le email ogni 5 minuti", isCorrect: false }
            ],
            explanation: "Disattivare le notifiche riduce le interruzioni involontarie e permette di mantenere il focus su compiti complessi."
        },
        xpReward: 50
    },
    "m1_p2": {
        id: "m1_p2",
        title: "Gestione Password",
        briefing: {
            text: "Una password debole è la porta d'ingresso principale per gli hacker. '123456' è ancora la password più usata al mondo.",
            keyPoints: [
                "Usa almeno 12 caratteri.",
                "Mischia lettere, numeri e simboli.",
                "Non riutilizzare mai la stessa password."
            ]
        },
        quiz: {
            question: "Quale di queste password è la più sicura?",
            options: [
                { id: "a", text: "Password123!", isCorrect: false },
                { id: "b", text: "Tr4tt0r3_Sp4z14l3$", isCorrect: true },
                { id: "c", text: "Giuseppe1980", isCorrect: false }
            ],
            explanation: "La password corretta è lunga, complessa e non contiene informazioni personali facilmente reperibili."
        },
        xpReward: 75
    },
    // Default fallback
    "default": {
        id: "default",
        title: "Sicurezza Base",
        briefing: {
            text: "La sicurezza informatica inizia dalla consapevolezza. Ogni azione online lascia una traccia.",
            keyPoints: [
                "Pensa prima di cliccare.",
                "Aggiorna sempre il software.",
                "Fai backup regolari."
            ]
        },
        quiz: {
            question: "Cosa dovresti fare se ricevi un'email sospetta?",
            options: [
                { id: "a", text: "Cliccare sul link per verificare", isCorrect: false },
                { id: "b", text: "Segnalarla come spam e cancellarla", isCorrect: true },
                { id: "c", text: "Rispondere chiedendo chi è", isCorrect: false }
            ],
            explanation: "Le email di phishing cercano di ingannarti. Non interagire mai con link o allegati sospetti."
        },
        xpReward: 50
    }
};
