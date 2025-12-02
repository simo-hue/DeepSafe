import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function redeemReferral(code: string, userId: string) {
    try {
        const { data, error } = await supabase.rpc('redeem_code', { code });

        if (error) throw error;

        // The RPC returns a JSON object with success/message
        return data as { success: boolean; message: string };

    } catch (error) {
        console.error('Error redeeming code:', error);
        return { success: false, message: 'Riscatto fallito.' };
    }
}
