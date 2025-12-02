import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

// Initialize Supabase Admin Client (Service Role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function DELETE(request: Request) {
    if (!supabaseKey) {
        return NextResponse.json({ error: 'Server configuration error: Missing Service Role Key' }, { status: 500 });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        console.log(`[Admin] Deleting user: ${userId}`);

        // Delete user from Supabase Auth (this usually cascades to public.profiles if configured, 
        // but we'll rely on Supabase's internal handling or manual cleanup if needed. 
        // Standard Supabase setup cascades auth.users delete to public tables if foreign keys are set to CASCADE)
        const { data, error } = await supabase.auth.admin.deleteUser(userId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' });

    } catch (error: any) {
        console.error('Delete user failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
