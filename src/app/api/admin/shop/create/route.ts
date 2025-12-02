import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const body = await request.json();
        const { itemData, lootData } = body;

        // 1. Insert Shop Item
        const { data: newItem, error: itemError } = await supabase
            .from('shop_items')
            .insert(itemData)
            .select()
            .single();

        if (itemError) throw itemError;

        // 2. Insert Loot (if any)
        if (lootData && lootData.length > 0) {
            const lootToInsert = lootData.map((l: any) => ({
                box_id: newItem.id,
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

        return NextResponse.json({ success: true, data: newItem });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
