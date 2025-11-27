import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Avatar = Database['public']['Tables']['avatars']['Row'];

export function useAvatars() {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const { data, error } = await supabase
                    .from('avatars')
                    .select('*')
                    .order('rarity', { ascending: true }); // Order by rarity or created_at

                if (error) throw error;

                // Sort by rarity: common, rare, epic, legendary
                const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
                const sortedData = (data || []).sort((a, b) => {
                    const rA = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
                    const rB = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
                    return rA - rB;
                });

                setAvatars(sortedData);
            } catch (err: any) {
                console.error('Error fetching avatars:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvatars();
    }, []);

    return { avatars, loading, error };
}
