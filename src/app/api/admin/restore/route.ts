import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

// Initialize Supabase Admin Client (Service Role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
    if (!supabaseKey) {
        return NextResponse.json({ error: 'Server configuration error: Missing Service Role Key' }, { status: 500 });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    try {
        const body = await request.json();
        const { data } = body;

        if (!data || !data.profiles) {
            return NextResponse.json({ error: 'Invalid backup file format' }, { status: 400 });
        }

        console.log('Starting Transactional Restore Process (RPC)...');

        // Call the RPC function 'admin_restore_data'
        // This function handles the entire transaction: delete all -> insert all -> rollback on error
        const { data: rpcData, error: rpcError } = await supabase.rpc('admin_restore_data', {
            payload: data
        });

        if (rpcError) {
            throw new Error(rpcError.message);
        }

        return NextResponse.json({ success: true, message: 'Restore completed successfully via RPC' });

    } catch (error: any) {
        console.error('Restore failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
