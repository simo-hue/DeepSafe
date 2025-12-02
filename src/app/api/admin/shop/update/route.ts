import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await request.json();
        const { id, itemData, lootData } = body;

        if (!id) throw new Error('Item ID is required');

        // 1. Update Shop Item
        const { error: itemError } = await supabase
            .from('shop_items')
            .update(itemData)
            .eq('id', id);

        if (itemError) throw itemError;

        // 2. Handle Loot (if mystery box)
        // Always delete existing loot for this box first to ensure clean state
        // Only if we are updating a mystery box or changing type FROM mystery box
        // But simpler strategy: always delete loot for this ID, then insert if new loot exists.

        await supabase.from('mystery_box_loot').delete().eq('box_id', id);

        if (lootData && lootData.length > 0) {
            const lootToInsert = lootData.map((l: any) => ({
                box_id: id,
                reward_type: l.reward_type,
                reward_value: l.reward_value,
                weight: l.weight,
                description: l.description
            }));

            const { error: lootError } = await supabase
                .from('mystery_box_loot')
                .insert(lootToInsert);

            if (lootError) throw lootError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
