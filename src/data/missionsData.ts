
export interface Problem {
    id: string;
    title: string;
    description: string;
    character: string;
    avatar?: string; // Optional avatar URL or icon name
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    problems: Problem[];
}

export const missionsData: Record<string, Mission[]> = {
    "CB": [
        {
            id: "m1",
            title: "Rilancio del Turismo Molisano",
            description: "Il Molise esiste e vuole farsi conoscere! Aiuta gli operatori locali a valorizzare il territorio.",
            problems: [
                {
                    id: "p1",
                    title: "Segnaletica Carente",
                    description: "I turisti si perdono cercando i tratturi. Progetta un sistema di indicazioni efficace.",
                    character: "Guida Alpina",
                    difficulty: "Easy"
                },
                {
                    id: "p2",
                    title: "Promozione Digitale",
                    description: "Nessuno trova gli agriturismi online. Crea una campagna social virale.",
                    character: "Social Media Manager",
                    difficulty: "Medium"
                },
                {
                    id: "p3",
                    title: "Trasporti Locali",
                    description: "I collegamenti tra i borghi sono inesistenti. Organizza una rete di navette.",
                    character: "Assessore ai Trasporti",
                    difficulty: "Hard"
                }
            ]
        }
    ],
    "CH": [
        {
            id: "m1",
            title: "Innovazione Industriale",
            description: "La zona industriale di Chieti ha bisogno di un upgrade tecnologico per competere.",
            problems: [
                {
                    id: "p1",
                    title: "Digitalizzazione Archivi",
                    description: "Le aziende usano ancora troppa carta. Introduci sistemi cloud.",
                    character: "Archivista",
                    difficulty: "Easy"
                },
                {
                    id: "p2",
                    title: "Automazione Logistica",
                    description: "I magazzini sono lenti. Implementa robot per lo smistamento.",
                    character: "Ingegnere Gestionale",
                    difficulty: "Medium"
                },
                {
                    id: "p3",
                    title: "Sostenibilità Energetica",
                    description: "I consumi sono alle stelle. Progetta un impianto fotovoltaico industriale.",
                    character: "Energy Manager",
                    difficulty: "Hard"
                }
            ]
        }
    ],
    "BA": [
        {
            id: "m1",
            title: "Smart City Bari",
            description: "Bari vuole diventare la capitale dell'innovazione del Sud. Risolvi le sfide urbane.",
            problems: [
                {
                    id: "p1",
                    title: "Parcheggi Intelligenti",
                    description: "Il traffico è caotico. Crea un'app per trovare parcheggio in tempo reale.",
                    character: "Vigile Urbano",
                    difficulty: "Easy"
                },
                {
                    id: "p2",
                    title: "Gestione Rifiuti",
                    description: "La differenziata non decolla. Incentiva i cittadini con la gamification.",
                    character: "Operatore Ecologico",
                    difficulty: "Medium"
                },
                {
                    id: "p3",
                    title: "Porto 4.0",
                    description: "Il porto ha bisogno di logistica avanzata per gestire i flussi commerciali.",
                    character: "Direttore del Porto",
                    difficulty: "Hard"
                }
            ]
        }
    ]
};
