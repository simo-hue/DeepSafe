export interface Avatar {
    id: string;
    name: string;
    description: string;
    minLevel: number;
    src: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const AVATARS: Avatar[] = [
    {
        id: 'avatar_rookie',
        name: 'Agente Recluta',
        description: 'Identità base assegnata ai nuovi operativi.',
        minLevel: 1,
        src: '/avatars/rookie.png',
        rarity: 'common'
    },
    {
        id: 'avatar_ninja',
        name: 'Cyber Ninja',
        description: 'Operativo specializzato in infiltrazioni silenziose.',
        minLevel: 5,
        src: '/avatars/ninja.png',
        rarity: 'rare'
    },
    {
        id: 'avatar_hacker',
        name: 'Elite Hacker',
        description: 'Maestro del codice e della manipolazione dati.',
        minLevel: 10,
        src: '/avatars/hacker.png',
        rarity: 'epic'
    },
    {
        id: 'avatar_architect',
        name: 'Architetto',
        description: 'Entità di alto livello con accesso root al sistema.',
        minLevel: 20,
        src: '/avatars/architect.png',
        rarity: 'legendary'
    }
];

export const getAvatarById = (id: string | null): Avatar => {
    return AVATARS.find(a => a.id === id) || AVATARS[0];
};
