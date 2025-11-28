
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role to act as admin/other users if needed

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testHeartGift() {
    // 1. Get a test user
    const { data: users, error: userError } = await supabase.from('profiles').select('id, current_hearts').limit(1);
    if (userError || !users || users.length === 0) {
        console.error('Error fetching user', userError);
        return;
    }
    const user = users[0];
    console.log(`Initial State: User ${user.id} has ${user.current_hearts} hearts`);

    // 2. Send a heart gift
    const { data: giftData, error: giftError } = await supabase.rpc('send_gift', {
        target_user_id: user.id,
        gift_type: 'hearts',
        gift_amount: 1,
        gift_message: 'Test Heart',
        gift_item_id: null,
        gift_icon_url: null
    });

    if (giftError) {
        console.error('Error sending gift', giftError);
        return;
    }
    console.log('Gift sent');

    // 3. Find the gift ID
    const { data: gifts, error: giftsError } = await supabase
        .from('gifts')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_claimed', false)
        .order('created_at', { ascending: false })
        .limit(1);

    if (giftsError || !gifts || gifts.length === 0) {
        console.error('Error finding gift', giftsError);
        return;
    }
    const giftId = gifts[0].id;
    console.log(`Found gift ${giftId}`);

    // 4. Claim the gift (simulating as user, but using service role which bypasses RLS, 
    // wait, claim_gift uses auth.uid(). We need to impersonate or just call the function directly if it was not security definer checking auth.uid().
    // It IS security definer and checks auth.uid().
    // So we can't easily test claim_gift via service role unless we can set auth context.
    // Alternatively, we can just run a SQL query to simulate it or trust the logic analysis.

    // Let's try to update the profile directly to see if there is a constraint.
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ current_hearts: (user.current_hearts || 0) + 1 })
        .eq('id', user.id);

    if (updateError) {
        console.log('Direct update failed:', updateError.message);
    } else {
        console.log('Direct update succeeded (if no constraint)');
    }

    // Check value again
    const { data: updatedUser } = await supabase.from('profiles').select('current_hearts').eq('id', user.id).single();
    console.log(`After direct update: User has ${updatedUser.current_hearts} hearts`);

    // Reset
    await supabase.from('profiles').update({ current_hearts: user.current_hearts }).eq('id', user.id);
}

testHeartGift();
