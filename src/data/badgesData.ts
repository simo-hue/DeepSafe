export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'Region' | 'Streak' | 'XP' | 'Special';
    xpReward: number;
    rarity: 'common' | 'rare' | 'legendary';
    condition: {
        type: 'region_master' | 'streak_milestone' | 'xp_milestone' | 'first_mission';
        value?: string | number; // Region name or numeric threshold
    };
}

export const BADGES_DATA: BadgeDefinition[] = [
    // --- Special Badges ---
    {
        id: 'first_blood',
        name: 'Primo Sangue',
        description: 'Completa la tua prima missione.',
        icon: '🩸',
        category: 'Special',
        xpReward: 50,
        rarity: 'common',
        condition: { type: 'first_mission' }
    },

    // --- Streak Badges ---
    {
        id: 'streak_3',
        name: 'Fuoco di Paglia',
        description: 'Raggiungi una serie di 3 giorni.',
        icon: '🔥',
        category: 'Streak',
        xpReward: 100,
        rarity: 'common',
        condition: { type: 'streak_milestone', value: 3 }
    },
    {
        id: 'streak_7',
        name: 'Settimana di Fuoco',
        description: 'Raggiungi una serie di 7 giorni.',
        icon: '🧨',
        category: 'Streak',
        xpReward: 250,
        rarity: 'rare',
        condition: { type: 'streak_milestone', value: 7 }
    },
    {
        id: 'streak_30',
        name: 'Leggenda Immortale',
        description: 'Raggiungi una serie di 30 giorni.',
        icon: '👑',
        category: 'Streak',
        xpReward: 1000,
        rarity: 'legendary',
        condition: { type: 'streak_milestone', value: 30 }
    },

    // --- XP Badges ---
    {
        id: 'xp_1000',
        name: 'White Hat',
        description: 'Guadagna 1.000 XP totali.',
        icon: '🎩',
        category: 'XP',
        xpReward: 200,
        rarity: 'common',
        condition: { type: 'xp_milestone', value: 1000 }
    },
    {
        id: 'xp_5000',
        name: 'Cyber Sentinel',
        description: 'Guadagna 5.000 XP totali.',
        icon: '🛡️',
        category: 'XP',
        xpReward: 500,
        rarity: 'rare',
        condition: { type: 'xp_milestone', value: 5000 }
    },

    // --- Region Badges (Generated for all 20 regions) ---
    {
        id: 'master_piemonte',
        name: 'Maestro del Piemonte',
        description: 'Completa tutte le province del Piemonte.',
        icon: '🏔️',
        category: 'Region',
        xpReward: 300,
        rarity: 'rare',
        condition: { type: 'region_master', value: 'Piemonte' }
    },
    {
        id: 'master_lombardia',
        name: 'Maestro della Lombardia',
        description: 'Completa tutte le province della Lombardia.',
        icon: '🏭',
        category: 'Region',
        xpReward: 300,
        rarity: 'rare',
        condition: { type: 'region_master', value: 'Lombardia' }
    },
    {
        id: 'master_veneto',
        name: 'Maestro del Veneto',
        description: 'Completa tutte le province del Veneto.',
        icon: '🎭',
        category: 'Region',
        xpReward: 300,
        rarity: 'rare',
        condition: { type: 'region_master', value: 'Veneto' }
    },
    {
        id: 'master_toscana',
        name: 'Maestro della Toscana',
        description: 'Completa tutte le province della Toscana.',
        icon: '🍷',
        category: 'Region',
        xpReward: 300,
        rarity: 'rare',
        condition: { type: 'region_master', value: 'Toscana' }
    },
    {
        id: 'master_lazio',
        name: 'Maestro del Lazio',
        description: 'Completa tutte le province del Lazio.',
        icon: '🏛️',
        category: 'Region',
        xpReward: 300,
        rarity: 'rare',
        condition: { type: 'region_master', value: 'Lazio' }
    },
    {
        id: 'master_campania',
        name: 'Maestro della Campania',
        description: 'Completa tutte le province della Campania.',
        icon: '🍕',
        category: 'Region',
        xpReward: 300,
        rarity: 'rare',
        condition: { type: 'region_master', value: 'Campania' }
    },
    {
        id: 'master_sicilia',
        name: 'Maestro della Sicilia',
        description: 'Completa tutte le province della Sicilia.',
        icon: '🍋',
        category: 'Region',
        xpReward: 300,
        rarity: 'rare',
        condition: { type: 'region_master', value: 'Sicilia' }
    },
    // Add more regions as needed or generate dynamically if preferred
];
