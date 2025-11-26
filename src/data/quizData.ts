import { provincesData } from './provincesData';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
    explanation: string;
}

export interface TrainingLesson {
    id: string;
    title: string;
    content: string; // Markdown or HTML content
    questions: QuizQuestion[];
    xpReward: number;
    estimatedTime: string; // e.g., "5 min"
}

// 1. Define the Content Library
const CONTENT_LIBRARY: Record<string, TrainingLesson> = {
    'cyber-basics': {
        id: 'cyber-basics',
        title: 'Fondamenti di Cybersecurity',
        content: `
# Benvenuto Agente.

La tua prima missione riguarda i fondamenti della sicurezza digitale.
In questo modulo imparerai a riconoscere le minacce più comuni.

## Phishing
Il phishing è un tentativo di truffa via email...

## Password Sicure
Una password sicura deve contenere almeno 12 caratteri...
        `,
        questions: [
            {
                id: 'q1',
                text: 'Qual è la lunghezza minima consigliata per una password sicura?',
                options: ['4 caratteri', '8 caratteri', '12 caratteri', '6 caratteri'],
                correctAnswer: 2,
                explanation: 'Le password con almeno 12 caratteri sono esponenzialmente più difficili da crackare.'
            },
            {
                id: 'q2',
                text: 'Cosa dovresti fare se ricevi una email sospetta?',
                options: ['Cliccare sul link', 'Rispondere al mittente', 'Segnalarla e cancellarla', 'Inoltrarla a un amico'],
                correctAnswer: 2,
                explanation: 'Non interagire mai con link o allegati sospetti. Segnala sempre al team di sicurezza.'
            }
        ],
        xpReward: 100,
        estimatedTime: '3 min'
    },
    'data-protection': {
        id: 'data-protection',
        title: 'Protezione Dati Sensibili',
        content: `
# Classificazione Dati

Non tutti i dati sono uguali. Impara a distinguere tra dati pubblici, interni e confidenziali.

## Dati Confidenziali
Includono informazioni personali (PII), dati finanziari...
        `,
        questions: [
            {
                id: 'q1',
                text: 'Quale di questi è un dato PII (Personally Identifiable Information)?',
                options: ['Codice Fiscale', 'Meteo di oggi', 'Nome dell\'azienda', 'Versione del software'],
                correctAnswer: 0,
                explanation: 'Il Codice Fiscale è un dato univoco che identifica una persona fisica.'
            }
        ],
        xpReward: 150,
        estimatedTime: '5 min'
    },
    'industrial-security': {
        id: 'industrial-security',
        title: 'Sicurezza Industriale (OT)',
        content: `
# Sicurezza nei Sistemi Industriali

Le regioni industriali sono bersagli critici. I sistemi SCADA e OT richiedono protezioni specifiche.

## Segregazione delle Reti
È fondamentale separare la rete IT (uffici) dalla rete OT (fabbrica)...
        `,
        questions: [
            {
                id: 'q1',
                text: 'Cosa significa OT in ambito cybersecurity?',
                options: ['Operational Technology', 'Over Time', 'Office Technology', 'Open Threat'],
                correctAnswer: 0,
                explanation: 'OT sta per Operational Technology, ovvero l\'hardware e il software che controllano i dispositivi fisici.'
            }
        ],
        xpReward: 200,
        estimatedTime: '6 min'
    },
    'financial-fraud': {
        id: 'financial-fraud',
        title: 'Prevenzione Frodi Finanziarie',
        content: `
# Difesa del Settore Finanziario

I centri finanziari sono sotto costante attacco. Impara a riconoscere le frodi avanzate.

## BEC (Business Email Compromise)
Una truffa in cui l'attaccante compromette account email aziendali per autorizzare pagamenti fraudolenti...
        `,
        questions: [
            {
                id: 'q1',
                text: 'Cos\'è un attacco BEC?',
                options: ['Un virus', 'Compromissione email aziendale', 'Un attacco DDoS', 'Un errore bancario'],
                correctAnswer: 1,
                explanation: 'BEC sta per Business Email Compromise, una truffa mirata alle aziende che effettuano bonifici.'
            }
        ],
        xpReward: 250,
        estimatedTime: '7 min'
    }
};

// 2. Define Mappings
// Map specific Province IDs to Content IDs
const PROVINCE_CONTENT_MAP: Record<string, string> = {
    'MI': 'financial-fraud', // Milano -> Financial
    'TO': 'industrial-security', // Torino -> Industrial
};

// Map Region Names to Content IDs (Fallback)
const REGION_CONTENT_MAP: Record<string, string> = {
    'Lombardia': 'industrial-security',
    'Piemonte': 'industrial-security',
    'Lazio': 'data-protection', // Roma/Government -> Data Protection
};

const DEFAULT_CONTENT_ID = 'cyber-basics';

// --- Helper to get lesson for a province ---
const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getLessonForProvince = async (provinceId: string, region: string): Promise<TrainingLesson> => {
    // 1. Try to fetch from DB
    const { data: mission } = await supabase
        .from('missions')
        .select(`
            *,
            mission_questions (*)
        `)
        .or(`province_id.eq.${provinceId},and(province_id.is.null,region.eq.${region})`)
        .limit(1)
        .maybeSingle();

    if (mission) {
        return {
            id: mission.id,
            title: mission.title,
            content: mission.content,
            questions: mission.mission_questions.map((q: any) => ({
                id: q.id,
                text: q.text,
                options: q.options,
                correctAnswer: q.correct_answer,
                explanation: q.explanation
            })),
            xpReward: mission.xp_reward,
            estimatedTime: mission.estimated_time
        };
    }

    // 2. Fallback to hardcoded content
    const contentId = PROVINCE_CONTENT_MAP[provinceId] || REGION_CONTENT_MAP[region] || DEFAULT_CONTENT_ID;
    return CONTENT_LIBRARY[contentId];
};

// Export for backward compatibility if needed, but prefer getLessonForProvince
export const quizData = CONTENT_LIBRARY;
